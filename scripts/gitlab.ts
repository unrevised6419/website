import { readFile } from "node:fs/promises";
import type {
	Contribution,
	Fetcher,
	FileProvider,
	Provider,
} from "./contributions";

export let fetchContributions: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	if (provider.type !== "gitlab") throw Error("Provider type should be GitLab");

	if (provider.access === "public") {
		return await fetchContributionsInternal(provider);
	} else {
		return await readContributionsFromFile(provider);
	}
};

let fetchContributionsInternal: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	if (provider.access !== "public")
		throw Error("Provider access should be public");

	let href = `${provider.origin}/users/${provider.username}/calendar.json`;

	let response = await fetch(href, { cache: "no-store" });
	let data: Record<string, number> = await response.json();

	let contributions = Object.entries(data).map<Contribution>(
		([date, count]) => [date, count],
	);

	console.log(
		`Fetched ${contributions.length} contributions from ${provider.name}`,
	);

	return contributions;
};

let readContributionsFromFile = async (
	provider: FileProvider,
): Promise<Contribution[]> => {
	let contributionsPath = `scripts/contributions/${provider.id}.json`;
	let data = await readFile(contributionsPath, "utf8");
	let activities = JSON.parse(data) as Record<string, number>;
	let contributions = Object.entries(activities);

	console.log(`Read ${contributions.length} contributions from ${provider.id}`);

	return contributions;
};
