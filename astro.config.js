import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import inline from "@playform/inline";

// https://astro.build/config
export default defineConfig({
	site: "https://luca.md/",
	integrations: [
		react(),
		tailwind(),
		inline({
			Exclude: (file) => !file.endsWith("dist/index.html"),
		}),
	],
});
