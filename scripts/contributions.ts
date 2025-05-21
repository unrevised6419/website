import { fetchContributions as fetchContributionsGitHub } from "./github";
import { fetchContributions as fetchContributionsGitLab } from "./gitlab";

type ProviderType = "github" | "gitlab";
type ProviderAccess = "public" | "file";

type BaseProvider = {
	id: string;
	access: ProviderAccess;
	name: string;
	type: ProviderType;
};

export interface PublicProvider extends BaseProvider {
	access: "public";
	username: string;
	origin: string;
}

export interface FileProvider extends BaseProvider {
	access: "file";
}

export type Provider = PublicProvider | FileProvider;

export type Level = 0 | 1 | 2 | 3 | 4;
export type Contribution = [date: string, count: number];
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
	let promises = providers.map((p) => ProviderFetcherMap[p.type](p));
	let data = (await Promise.all(promises)).flat();
	let combined: Record<string, number> = {};

	const oneYearAgo = new Date();
	oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
	const oneYearAgoString = oneYearAgo.toISOString().split("T")[0] as string;

	for (let [date, count] of data) {
		if (date < oneYearAgoString) continue;
		combined[date] ??= 0;
		combined[date] += count;
	}

	const entries = Object.entries(combined);

	return entries
		.sort((c1, c2) => new Date(c1[0]).getTime() - new Date(c2[0]).getTime())
		.map(([date, count]) => ({ date, level: getLevel(count), count }));
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
