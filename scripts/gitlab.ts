import type { Contribution, Fetcher, Provider } from "./contributions";

export let fetchContributions: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	let href = `${provider.origin}/users/${provider.username}/calendar.json`;

	console.log(`Fetching contributions from ${href}`);

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
