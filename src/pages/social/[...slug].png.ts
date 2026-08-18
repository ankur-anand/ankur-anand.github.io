import type { APIRoute, GetStaticPaths } from "astro";
import { getPublishedPosts, slugifyTag } from "../../lib/posts";
import {
  renderSocialCard,
  renderSocialImage,
  type SocialCard,
} from "../../lib/social-card";

interface Props {
  card: SocialCard;
  sourceImage?: string;
}

interface CardRoute extends Props {
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  const tags = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      const existing = tags.get(slug);
      tags.set(slug, { name: tag, count: (existing?.count ?? 0) + 1 });
    }
  }

  const pages: CardRoute[] = [
    {
      slug: "home",
      card: {
        eyebrow: "Software engineer and writer",
        title: "Ankur Anand",
        footer: "Go · Distributed systems · Databases · Performance",
      },
    },
    {
      slug: "about",
      card: {
        eyebrow: "About",
        title: "Ankur Anand",
        footer: "Distributed systems · Platform infrastructure · Go",
      },
    },
    {
      slug: "writing",
      card: {
        eyebrow: "Writing",
        title: "Go, databases & distributed systems",
        footer: "Essays · Visual guides · Source code · Experiments",
      },
    },
  ];

  const articleCards: CardRoute[] = posts.map((post) => ({
      slug: `blog/${post.id}`,
      card: {
        title: post.data.title,
      },
      sourceImage: post.data.socialImage ?? post.data.coverImage,
    }));

  const tagCards: CardRoute[] = [...tags].map(([slug, tag]) => ({
    slug: `tags/${slug}`,
    card: {
      eyebrow: "Writing by Ankur Anand",
      title: `${tag.name} articles`,
      footer: `${tag.count} ${tag.count === 1 ? "article" : "articles"} · ankuranand.com`,
    },
  }));

  return [...pages, ...articleCards, ...tagCards].map(({ slug, card, sourceImage }) => ({
    params: { slug },
    props: { card, sourceImage },
  }));
};

export const GET: APIRoute<Props> = async ({ props }) => {
  const image = props.sourceImage
    ? await renderSocialImage(props.sourceImage)
    : await renderSocialCard(props.card);

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
