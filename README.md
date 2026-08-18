# ankuranand.com

## Run locally

1. Install Node.js 22.12 or newer.
2. Install dependencies and start Astro:

```sh
npm install
npm run dev
```

3. Validate a production build:

```sh
npm run build
```

## Publish an article

1. Create a dated draft and answer the metadata prompts:

```sh
make new-article
```

2. Write the article and keep `draft: true` while working.
3. Validate it with `make build`.
4. Publish it:

```sh
make publish-article POST=src/content/blog/YYYY/MM/DD/article-slug.mdx
```

The publish command sets `draft: false`, runs the complete production build,
stages only the article and `public/images/blog/<article-slug>/` when present,
commits them, and pushes `master`.

## Edit homepage projects

1. Edit `src/data/projects.txt`.
2. Add one project per line:

```text
Project name | A short description | https://github.com/owner/repository
```

3. Reorder lines to change the homepage order.
4. Run `npm run build`.

## Set article canonical URLs

External mirrors are automatically excluded from the sitemap. New original
articles are self-canonical and automatically included.

## Validate the archive

```sh
npm run validate:inventory
```

Run `npm run build` before publishing. It also checks Astro and runs the archive
validator.

## Configure analytics

Edit the GA4 measurement ID in `src/lib/site.ts`.

## Configure social cards

- Leave `socialImage` unset to generate a title-only 1200 × 630 card.
- Set `socialImage` and `socialImageAlt` to use an existing article image.
- Set `coverImage` and `coverImageAlt` when the image should also appear in the
  article. `coverImage` becomes the social image when `socialImage` is unset.
- Edit the shared generated-card design in `src/lib/social-card.ts`.
