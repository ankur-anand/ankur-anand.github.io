#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

const requestedPath = process.argv[2];
if (!requestedPath) throw new Error("An article path is required.");

const contentRoot = resolve("src/content/blog");
const articlePath = resolve(requestedPath);
const relativePath = relative(contentRoot, articlePath);
const isInsideContent =
  relativePath &&
  !relativePath.startsWith(`..${sep}`) &&
  relativePath !== ".." &&
  [".md", ".mdx"].includes(extname(articlePath));

if (!isInsideContent) {
  throw new Error("Article must be a Markdown or MDX file inside src/content/blog.");
}

const article = await readFile(articlePath, "utf8");
const frontmatter = article.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
if (!frontmatter) throw new Error("Article is missing YAML frontmatter.");

if (!/^draft:\s*(?:true|false)\s*$/m.test(frontmatter[1])) {
  throw new Error("Article frontmatter must contain draft: true or draft: false.");
}

if (/^draft:\s*true\s*$/m.test(frontmatter[1])) {
  const published = article.replace(/^draft:\s*true\s*$/m, "draft: false");
  await writeFile(articlePath, published, "utf8");
  console.log(`Marked as published: ${relativePath.split(sep).join("/")}`);
} else {
  console.log(`Already marked as published: ${relativePath.split(sep).join("/")}`);
}
