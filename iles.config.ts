import { defineConfig } from "iles";
import images, { hdPreset } from "@islands/images";

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
});
