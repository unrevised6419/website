import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import inline from "@playform/inline";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://luca.md/",
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
