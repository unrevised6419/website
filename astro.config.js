import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import inline from "@playform/inline";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://all1n.dev/",
	integrations: [
		react(),
		inline({
			Exclude: (file) => !file.endsWith("dist/index.html"),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
