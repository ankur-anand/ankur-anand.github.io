#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const contentRoot = resolve("src/content/blog");
const imageRoot = resolve("public");
const distRoot = resolve("dist");
const site = new URL("https://ankuranand.com");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

function builtPath(url) {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith("/")) return join(distRoot, pathname, "index.html");
  return join(distRoot, pathname);
}

function frontmatter(markdown, label) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert(match, `${label} is missing frontmatter`);
  return match[1];
}

function scalar(metadata, key) {
  const match = metadata.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m"));
  if (!match) return undefined;

  const value = match[1].trim();
  if (value.startsWith('"') && value.endsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function articleUrl(sourcePath) {
  const slug = relative(contentRoot, sourcePath)
    .split(sep)
    .join("/")
    .replace(/\.(?:md|mdx)$/, "");
  return new URL(`/blog/${slug}/`, site).href;
}

const siteConfig = await readFile(resolve("src/lib/site.ts"), "utf8");
const analyticsId = siteConfig.match(/googleAnalyticsId:\s*["']([^"']+)["']/)?.[1];
assert(analyticsId, "Could not read the GA4 measurement ID from src/lib/site.ts");

const sourceFiles = (await walk(contentRoot)).filter((path) => [".md", ".mdx"].includes(extname(path)));
const publishedArticles = [];
const referencedImages = new Set();

for (const sourcePath of sourceFiles) {
  const markdown = await readFile(sourcePath, "utf8");
  const metadata = frontmatter(markdown, sourcePath);
  const targetUrl = articleUrl(sourcePath);
  const output = builtPath(targetUrl);
  const draft = scalar(metadata, "draft") === "true";

  if (draft) {
    assert(!(await exists(output)), `Draft article was built: ${targetUrl}`);
    continue;
  }

  const configuredCanonical = scalar(metadata, "canonicalUrl");
  const canonicalUrl = configuredCanonical ? new URL(configuredCanonical).href : targetUrl;
  const isExternalMirror = new URL(canonicalUrl).origin !== site.origin;
  publishedArticles.push({ canonicalUrl, isExternalMirror, targetUrl });

  assert(!/\{%[\s\S]*?%\}/.test(markdown), `${targetUrl} still contains a Hexo tag`);

  for (const match of markdown.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)(?:\s+[^)]*)?\)/g)) {
    referencedImages.add(match[1]);
  }
  for (const match of markdown.matchAll(/<img\b[^>]*\bsrc=["'](\/images\/[^"']+)["'][^>]*>/gi)) {
    referencedImages.add(match[1]);
  }
  assert(
    !/!\[[^\]]*\]\(https?:\/\//i.test(markdown) &&
      !/<img\b[^>]*\bsrc=["']https?:\/\//i.test(markdown),
    `${targetUrl} still depends on a remote article image`,
  );

  for (const key of ["coverImage", "socialImage"]) {
    const image = scalar(metadata, key);
    if (image) referencedImages.add(image);
  }

  assert(await exists(output), `Missing built article: ${targetUrl}`);
  const html = await readFile(output, "utf8");
  assert(
    html.includes(`<link rel="canonical" href="${canonicalUrl}">`),
    `Incorrect canonical for ${targetUrl}`,
  );
  assert(
    html.includes(`<meta property="og:url" content="${canonicalUrl}">`),
    `Incorrect Open Graph URL for ${targetUrl}`,
  );
  assert(html.includes('"@type":"BlogPosting"'), `Missing BlogPosting data for ${targetUrl}`);
  assert(html.includes(analyticsId), `Missing GA4 on ${targetUrl}`);
  assert(
    !/<aside class="article-toc">[\s\S]*?<ol>\s*<\/ol>/.test(html),
    `Empty table of contents on ${targetUrl}`,
  );
}

for (const image of referencedImages) {
  assert(await exists(join(imageRoot, image.replace(/^\/+/, ""))), `Missing local image: ${image}`);
}

const sitemapFiles = (await readdir(distRoot))
  .filter((name) => /^sitemap-\d+\.xml$/.test(name))
  .map((name) => join(distRoot, name));
assert(sitemapFiles.length > 0, "No generated content sitemap found");
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(file, "utf8")))).join("\n");
for (const article of publishedArticles) {
  const isInSitemap = sitemap.includes(`<loc>${article.targetUrl}</loc>`);
  if (article.isExternalMirror) {
    assert(!isInSitemap, `Mirrored article must not appear in sitemap: ${article.targetUrl}`);
  } else {
    assert(isInSitemap, `Self-canonical article is missing from sitemap: ${article.targetUrl}`);
  }
}

const mirrorCount = publishedArticles.filter((article) => article.isExternalMirror).length;
const originalCount = publishedArticles.length - mirrorCount;
console.log(
  `Built inventory valid: ${publishedArticles.length} published articles ` +
    `(${mirrorCount} external mirrors and ${originalCount} self-canonical), ` +
    `${sourceFiles.length} content files, and ${referencedImages.size} referenced local images.`,
);
console.log(
  `Every published article has the expected canonical, sitemap status, structured data, local assets, and GA4 ${analyticsId}.`,
);
