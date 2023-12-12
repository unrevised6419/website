import { fetchContributions as fetchContributionsGitHub } from "./github";
import { fetchContributions as fetchContributionsGitLab } from "./gitlab";

type ProviderType = "github" | "gitlab";
export type Provider = {
	name: string;
	provider: ProviderType;
	username: string;
	origin: string;
};

export type Level = 0 | 1 | 2 | 3 | 4;
export type Contribution = [year: string, count: number];
export interface Activity {
	date: string;
	count: number;
	level: Level;
}
export type Fetcher = (provider: Provider) => Promise<Contribution[]>;

let ProviderFetcherMap: Record<ProviderType, Fetcher> = {
	github: fetchContributionsGitHub,
	gitlab: fetchContributionsGitLab,
};

export async function getAggregateContributions(
	providers: Array<Provider>,
): Promise<Activity[]> {
	let promises = providers.map((p) => ProviderFetcherMap[p.provider](p));
	let data = (await Promise.all(promises)).flat();
	let combined: Record<string, number> = {};

	for (let [date, count] of data) {
		combined[date] ??= 0;
		combined[date] += count;
	}

	return Object.entries(combined)
		.sort((c1, c2) => new Date(c1[0]).getTime() - new Date(c2[0]).getTime())
		.map(([date, count]) => ({ date, count, level: getLevel(count) }));
}

// GitLab Levels
function getLevel(count: number): Level {
	if (count >= 30) {
		return 4;
	}

	if (count >= 20) {
		return 3;
	}

	if (count >= 10) {
		return 2;
	}

	if (count >= 1) {
		return 1;
	}

	return 0;
}
