#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createInterface } from "node:readline/promises";
import { resolve } from "node:path";
import { stdin, stdout } from "node:process";

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const supplied = {
  slug: process.env.ARTICLE_SLUG?.trim() ?? "",
  title: process.env.ARTICLE_TITLE?.trim() ?? "",
  description: process.env.ARTICLE_DESCRIPTION?.trim() ?? "",
  tags: process.env.ARTICLE_TAGS?.trim() ?? "",
  date: process.env.ARTICLE_DATE?.trim() ?? "",
};

const needsPrompt = Object.values(supplied).some((value) => !value);
if (needsPrompt && !stdin.isTTY) {
  throw new Error(
    "Missing article metadata. Run make new-article in a terminal or provide SLUG, TITLE, DESCRIPTION, TAGS, and DATE.",
  );
}

const prompt = needsPrompt ? createInterface({ input: stdin, output: stdout }) : undefined;
async function answer(label, suppliedValue, fallback = "") {
  if (suppliedValue) return suppliedValue;
  const suffix = fallback ? ` [${fallback}]` : "";
  const value = (await prompt.question(`${label}${suffix}: `)).trim();
  return value || fallback;
}

try {
  const slug = await answer("Slug", supplied.slug);
  const title = await answer("Title", supplied.title);
  const description = await answer("Description", supplied.description);
  const tagInput = await answer("Tags (comma-separated)", supplied.tags);
  const publishedAt = await answer("Publication date", supplied.date, localDate());
  const tags = tagInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must contain lowercase letters, numbers, and single hyphens only.");
  }
  if (!title) throw new Error("Title is required.");
  if (description.length < 20 || description.length > 180) {
    throw new Error("Description must contain between 20 and 180 characters.");
  }
  if (tags.length === 0) throw new Error("At least one tag is required.");
  const parsedDate = new Date(`${publishedAt}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== publishedAt
  ) {
    throw new Error("Publication date must use YYYY-MM-DD.");
  }

  const [year, month, day] = publishedAt.split("-");
  const directory = resolve("src/content/blog", year, month, day);
  const target = resolve(directory, `${slug}.mdx`);

  if (await exists(target)) throw new Error(`Article already exists: ${target}`);

  const template = await readFile(resolve("templates/post.mdx"), "utf8");
  const article = template
    .replace(/^title:.*$/m, `title: ${JSON.stringify(title)}`)
    .replace(/^description:.*$/m, `description: ${JSON.stringify(description)}`)
    .replace(/^publishedAt:.*$/m, `publishedAt: ${publishedAt}`)
    .replace(/^tags:.*$/m, `tags: ${JSON.stringify(tags)}`);

  await mkdir(directory, { recursive: true });
  await writeFile(target, article, { encoding: "utf8", flag: "wx" });

  console.log(`Created draft: ${target}`);
  console.log(`Publish with: make publish-article POST=${target.replace(`${process.cwd()}/`, "")}`);
} finally {
  prompt?.close();
}
