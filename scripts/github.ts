import { type AnyNode, type BasicAcceptedElems, load } from "cheerio";
import type { Contribution, Fetcher, Provider } from "./contributions";

export let fetchContributions: Fetcher = async (
	provider: Provider,
): Promise<Contribution[]> => {
	let fromDate = new Date();
	fromDate.setFullYear(fromDate.getFullYear() - 1);
	let from = `${fromDate.getFullYear()}-${fromDate.getMonth()}-${fromDate.getDate()}`;

	let toDate = new Date();
	let to = `${toDate.getFullYear()}-${toDate.getMonth()}-${toDate.getDate()}`;

	let url = new URL(`${provider.origin}/${provider.username}`);
	url.searchParams.set("from", from);
	url.searchParams.set("to", to);

	let data = await fetch(url.href);

	let $ = load(await data.text());
	let $days = $(".js-calendar-graph-svg .ContributionCalendar-day");

	let parseDay = (day: BasicAcceptedElems<AnyNode>): Contribution => {
		let $day = $(day);
		let date = $day.attr("data-date");

		if (!date) {
			throw Error("Unable to parse date attribute");
		}

		let countMatch = $day
			.text()
			.trim()
			.match(/^[1-9]+\s/) ?? ["0"];

		let count = parseInt(countMatch[0]);

		if (isNaN(count)) {
			throw Error("Unable to parse contribution count for day");
		}

		return [date, count];
	};

	return $days.get().map((day) => parseDay(day));
};
