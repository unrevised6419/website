import { load, type Cheerio, type CheerioAPI } from "cheerio";
import { type AnyNode } from "domhandler";
import type { Contribution, Fetcher, Provider } from "./contributions";

export let fetchContributions: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	if (provider.type !== "github") throw Error("Provider type should be GitHub");
	if (provider.access === "file")
		throw Error("File GitHub provider not implemented");

	let href = `${provider.origin}/${provider.username}?tab=contributions`;

	let data = await fetch(href, {
		cache: "no-store",
		headers: { "x-requested-with": "XMLHttpRequest" },
	});
	let $ = load(await data.text());
	let $days = $(".js-calendar-graph-table .ContributionCalendar-day");

	let contributions = $days.get().map((day) => parseDay($(day), $));

	console.log(
		`Fetched ${contributions.length} contributions from ${provider.name}`,
	);

	return contributions;
};

function parseDay($day: Cheerio<AnyNode>, $: CheerioAPI): Contribution {
	let date = $day.attr("data-date");

	if (!date) {
		throw Error("Unable to parse date attribute");
	}

	let id = $day.attr("id");
	let countMatch = $(`tool-tip[for="${id}"]`)
		.text()
		.trim()
		.match(/^[1-9]+\s/) ?? ["0"];

	let count = parseInt(countMatch[0]);

	if (isNaN(count)) {
		throw Error("Unable to parse contribution count for day");
	}

	return [date, count];
}
