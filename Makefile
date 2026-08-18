SHELL := /bin/sh

POST ?=
SLUG ?=
TITLE ?=
DESCRIPTION ?=
TAGS ?=
DATE ?=
MESSAGE ?=Publish article: $(notdir $(basename $(POST)))

.PHONY: help dev build new-article publish-article

help:
	@echo "make dev"
	@echo "make build"
	@echo "make new-article"
	@echo "make publish-article POST=src/content/blog/YYYY/MM/DD/article-slug.mdx"

dev:
	npm run dev

build:
	npm run build

new-article:
	@ARTICLE_SLUG="$(SLUG)" \
		ARTICLE_TITLE="$(TITLE)" \
		ARTICLE_DESCRIPTION="$(DESCRIPTION)" \
		ARTICLE_TAGS="$(TAGS)" \
		ARTICLE_DATE="$(DATE)" \
		node scripts/new-article.mjs

publish-article:
	@test -n "$(POST)" || { echo "POST is required."; echo "Example: make publish-article POST=src/content/blog/YYYY/MM/DD/article-slug.mdx"; exit 1; }
	@test "$$(git branch --show-current)" = "master" || { echo "Publish from the master branch."; exit 1; }
	@git diff --cached --quiet || { echo "The index already contains staged changes. Commit or unstage them before publishing an article."; exit 1; }
	@node scripts/publish-article.mjs "$(POST)"
	npm run build
	@asset_dir="public/images/blog/$$(basename "$(POST)" | sed -E 's/\.(md|mdx)$$//')"; \
		git add -- "$(POST)"; \
		if test -d "$$asset_dir"; then git add -- "$$asset_dir"; fi
	@if git diff --cached --quiet; then echo "No article changes to publish."; exit 1; fi
	git commit -m "$(MESSAGE)"
	git push origin master
