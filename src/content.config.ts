import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./posts" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		created_at: z.coerce.date(),
		edited_at: z.coerce.date().optional(),
		published_at: z.coerce.date().optional(),
	}),
});

export const collections = { blog };
