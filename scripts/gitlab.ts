import { Contribution, Fetcher, Provider } from "./contributions";

export let fetchContributions: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	let href = `${provider.origin}/users/${provider.username}/calendar.json`;
	let response = await fetch(href);
	let data: Record<string, number> = await response.json();

	return Object.entries(data).map(([date, count]) => [date, count]);
};
