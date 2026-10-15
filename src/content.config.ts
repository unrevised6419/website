import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./posts" }),
	schema: z.object({
		title: z.string(),
		// Title for <title>, og:title and twitter:title, which get truncated past
		// ~60 characters. The page heading, post list and OG image keep `title`.
		og_title: z.string().max(60),
		// Search results show ~120–160 characters.
		description: z.string().min(120).max(160),
		// Description for og:description and twitter:description, which social
		// previews truncate. Search results and the post list keep `description`.
		og_description: z.string().max(125),
		created_at: z.coerce.date(),
		edited_at: z.coerce.date().optional(),
		published_at: z.coerce.date().optional(),
	}),
});

export const collections = { blog };
