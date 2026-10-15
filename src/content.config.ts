import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./posts" }),
	schema: z.object({
		title: z.string(),
		// Optional shorter title for <title>, og:title and twitter:title, which
		// get truncated past ~60 characters. The page heading, post list and
		// OG image keep `title`.
		og_title: z.string().optional(),
		description: z.string(),
		created_at: z.coerce.date(),
		edited_at: z.coerce.date().optional(),
		published_at: z.coerce.date().optional(),
	}),
});

export const collections = { blog };
