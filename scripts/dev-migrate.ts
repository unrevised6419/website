import { mkdir, writeFile } from "node:fs/promises";
import { log } from "node:console";
import gray from "gray-matter";
import yaml from "js-yaml";

// import articles from "../devto-export-2025-12-08/articles.json" with { type: "json" };
const articles: any[] = [];

await mkdir("./posts", { recursive: true });

for (const article of articles) {
	const date = new Date(article.created_at);
	const dateString = date.toISOString().split("T")[0];
	const clearSlug = article.slug.split("-").slice(0, -1).join("-");
	const finalSlug = `${dateString}-${clearSlug}`;
	const filename = `./posts/${finalSlug}.md`;

	const matterFile = gray(article.body_markdown);

	const matterData = {
		title: matterFile.data.title || article.title,
		description: matterFile.data.description || article.description,
		tags: matterFile.data.tags || article.cached_tag_list,
		created_at: article.created_at,
		edited_at: article.edited_at,
		published_at: article.published_at,
	};

	const content = gray.stringify(matterFile.content, matterData, {
		engines: {
			yaml: {
				parse: (input) => yaml.load(input) as Record<string, unknown>,
				stringify: (input) => yaml.dump(input),
			},
		},
	});

	await writeFile(filename, content);
	log(`Written ${matterData.title}`);
}
