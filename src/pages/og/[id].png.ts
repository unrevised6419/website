import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "../../lib/og";

// One prerendered PNG per post: dist/og/<post-id>.png
export const getStaticPaths: GetStaticPaths = async () => {
	let posts = await getCollection("blog");
	return posts.map((post) => ({
		params: { id: post.id },
		props: { post },
	}));
};

export const GET: APIRoute = async ({ props }) => {
	let { post } = props as {
		post: Awaited<ReturnType<typeof getCollection<"blog">>>[number];
	};

	let png = await renderOgImage({
		title: post.data.title,
		date: post.data.created_at ?? post.data.edited_at,
	});

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
