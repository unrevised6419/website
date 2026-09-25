import { defineConfig } from "astro/config";

import inline from "@playform/inline";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://all1n.dev/",
	integrations: [
		inline({
			Beasties: {
				pruneSource: false,
			},
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
