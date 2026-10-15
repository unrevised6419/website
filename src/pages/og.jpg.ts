import type { APIRoute } from "astro";
import { renderHomeOgImage } from "../lib/og";

// Prerendered site-wide image: dist/og.jpg
export const GET: APIRoute = async () => {
	let jpeg = await renderHomeOgImage();

	return new Response(new Uint8Array(jpeg), {
		headers: {
			"Content-Type": "image/jpeg",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
