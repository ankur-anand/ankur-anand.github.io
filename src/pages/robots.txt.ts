import type { APIRoute } from "astro";
import { SITE } from "../lib/site";

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("sitemap-index.xml", site ?? SITE.url);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
