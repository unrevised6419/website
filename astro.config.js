import { defineConfig } from "astro/config";

import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

/**
 * Wraps every table in a container that scrolls sideways, so wide tables
 * don't squeeze their columns on narrow screens. The container is focusable
 * so keyboard users can scroll it too.
 */
function rehypeScrollableTables() {
	return wrapTables;
}

/** @param {{ children?: any[] }} node */
function wrapTables(node) {
	node.children?.forEach((child, index) => {
		if (child.type === "element" && child.tagName === "table") {
			node.children[index] = {
				type: "element",
				tagName: "div",
				properties: {
					className: [
						"my-7 overflow-x-auto",
						"[&>table]:my-0 [&>table]:min-w-xl",
						"[&_th]:whitespace-nowrap",
					],
					tabIndex: 0,
				},
				children: [child],
			};
		} else {
			wrapTables(child);
		}
	});
}

// https://astro.build/config
export default defineConfig({
	site: "https://all1n.dev/",
	build: {
		// The whole stylesheet is small enough to inline, and inlining it avoids
		// the deferred-stylesheet flash that critical-CSS extraction caused.
		inlineStylesheets: "always",
	},
	markdown: {
		processor: unified({
			// Astro adds heading ids after user plugins run, so add them first for
			// the autolink plugin to find.
			rehypePlugins: [
				rehypeHeadingIds,
				[rehypeAutolinkHeadings, { behavior: "wrap" }],
				rehypeScrollableTables,
			],
		}),
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
