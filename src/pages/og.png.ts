import type { APIRoute } from "astro";
import { renderHomeOgImage } from "../lib/og";

// Prerendered site-wide image: dist/og.png
export const GET: APIRoute = async () => {
	let png = await renderHomeOgImage();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
