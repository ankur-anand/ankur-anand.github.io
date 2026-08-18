import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const site = "https://ankuranand.com";
const contentRoot = fileURLToPath(new URL("./src/content/blog", import.meta.url));

function contentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? contentFiles(path) : [path];
  });
}

const mirroredArticlePaths = new Set(
  contentFiles(contentRoot)
    .filter((path) => [".md", ".mdx"].includes(extname(path)))
    .filter((path) => {
      const canonical = readFileSync(path, "utf8").match(
        /^canonicalUrl:\s*["']?([^"'\s]+)["']?\s*$/m,
      )?.[1];
      return canonical && new URL(canonical).origin !== site;
    })
    .map(
      (path) =>
        `/blog/${relative(contentRoot, path)
          .split(sep)
          .join("/")
          .replace(/\.(?:md|mdx)$/, "")}/`,
    ),
);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !pathname.startsWith("/preview/") && !mirroredArticlePaths.has(pathname);
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});
