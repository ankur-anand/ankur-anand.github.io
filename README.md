# ankuranand.com

The personal site and writing archive of Ankur Anand. It is built with Astro,
stores articles as Markdown/MDX, and publishes static HTML to GitHub Pages.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Before publishing a change:

```sh
npm run build
```

## Publishing an article

1. Copy `templates/post.mdx` to `src/content/blog/<article-slug>.mdx`.
2. Fill in the frontmatter and write the article.
3. Keep `draft: true` until it is ready.
4. Run `npm run build` to validate metadata, links, and generated pages.
5. Set `draft: false` and merge the change into `master`.

The deployment workflow publishes the generated `dist/` directory. In the
repository's GitHub Pages settings, the publishing source must be set to
**GitHub Actions**.

## Homepage projects

Edit `src/data/projects.txt` to add, remove, reorder, or rewrite showcased
projects. Each non-comment line uses this format:

```text
Project name | A short description | https://github.com/owner/repository
```

## SEO and the imported archive

The site generates canonical links, Open Graph and social metadata,
`BlogPosting` structured data, RSS, `robots.txt`, and XML sitemaps. The imported
articles are currently reading mirrors rather than a domain migration:

- every article available on Medium keeps Medium as its canonical source;
- each legacy-only article keeps its `blog.ankuranand.com` canonical source;
- mirrored `ankuranand.com/blog/...` URLs are excluded from the XML sitemap;
- existing Medium and legacy-blog URLs remain unchanged.

New original articles omit `canonicalUrl`. They are self-canonical and are
automatically included in the sitemap. Set `canonicalUrl` only when publishing
a local reading copy of content whose canonical source is elsewhere.

Article frontmatter is the source of truth for this policy. After building,
the inventory validator checks every published article's canonical URL,
sitemap status, structured data, GA4 tag, and local images:

```sh
npm run validate:inventory
```

Google Analytics 4 is configured once in `src/lib/site.ts` and loaded by the
shared page layout, so the same measurement ID applies to every generated page.

Social cards are generated as 1200 × 630 PNGs during the Astro build. Home,
About, Writing, tag archives, and every published article receive a card using
the shared design in `src/lib/social-card.ts`. Article titles, dates, and tags
come directly from Markdown frontmatter. Set `socialImage` and `socialImageAlt`
to build the card from an existing article illustration without displaying it
again at the top of the article. A `coverImage` is also used for the social card
when no separate `socialImage` is selected.
