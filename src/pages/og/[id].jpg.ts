import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage } from "../../lib/og";

// One prerendered JPEG per post: dist/og/<post-id>.jpg
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

	let jpeg = await renderOgImage({
		title: post.data.title,
		date: post.data.created_at ?? post.data.edited_at,
	});

	return new Response(new Uint8Array(jpeg), {
		headers: {
			"Content-Type": "image/jpeg",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
