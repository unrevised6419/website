import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://all1n.dev/",
	build: {
		// The whole stylesheet is small enough to inline, and inlining it avoids
		// the deferred-stylesheet flash that critical-CSS extraction caused.
		inlineStylesheets: "always",
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
