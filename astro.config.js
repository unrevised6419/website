import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import critters from "astro-critters";

// https://astro.build/config
export default defineConfig({
	site: "https://iamandrewluca.com/",
	integrations: [
		react(),
		tailwind(),
		critters({
			Exclude: (file) => !file.endsWith("dist/index.html"),
		}),
	],
});
