import { defineConfig } from "astro/config";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
	site: "https://all1n.dev/",
	build: {
		// The whole stylesheet is small enough to inline, and inlining it avoids
		// the deferred-stylesheet flash that critical-CSS extraction caused.
		inlineStylesheets: "always",
	},
	markdown: {
		// Astro adds heading ids after user plugins run, so add them first for
		// the autolink plugin to find.
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: "wrap" }],
		],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
