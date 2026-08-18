import rss from "@astrojs/rss";
import { getPostUrl, getPublishedPosts } from "../lib/posts";
import { SITE } from "../lib/site";

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: `${SITE.name} — Writing`,
    description: SITE.description,
    site: context.site ?? new URL(SITE.url),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: getPostUrl(post),
      categories: post.data.tags,
    })),
    customData: "<language>en-us</language>",
  });
}
