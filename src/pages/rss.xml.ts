import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_NAME } from "../consts";

export async function GET(context: APIContext) {
	let posts = await getCollection("blog");
	let sortedPosts = posts.toSorted(
		(a, b) => b.data.created_at.getTime() - a.data.created_at.getTime(),
	);

	return rss({
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		site: context.site ?? "https://all1n.dev/",
		items: sortedPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.created_at,
			link: `/posts/${post.id}`,
		})),
		customData: "<language>en</language>",
	});
}
