import { defineConfig } from "iles";
import images, { hdPreset } from "@islands/images";
import Critters from "critters";

export default defineConfig({
	siteUrl: "https://iamandrewluca.com/",
	modules: [
		images({
			profile: hdPreset({
				widths: [128, 128],
				loading: "eager",
				formats: {
					webp: { quality: 44 },
					original: {},
				},
			}),
		}),
	],
	ssg: {
		async beforePageRender(page, config) {
			let critters = new Critters({ path: config.outDir });
			page.rendered = await critters.process(page.rendered);
		},
	},
	vue: {
		// Iles does not work if disabling reactivityTransform
		// reactivityTransform: false,
	},
});
