import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(20).max(180),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string().min(1)).default([]),
      series: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      coverImage: z.string().startsWith("/").optional(),
      coverImageAlt: z.string().optional(),
      socialImage: z.string().startsWith("/").optional(),
      socialImageAlt: z.string().optional(),
      canonicalUrl: z.url().optional(),
      originalUrl: z.url().optional(),
      legacyUrls: z.array(z.url()).default([]),
    })
    .refine((post) => !post.coverImage || post.coverImageAlt, {
      message: "coverImageAlt is required when coverImage is set",
      path: ["coverImageAlt"],
    })
    .refine((post) => !post.socialImage || post.socialImageAlt, {
      message: "socialImageAlt is required when socialImage is set",
      path: ["socialImageAlt"],
    }),
});

export const collections = { blog };
