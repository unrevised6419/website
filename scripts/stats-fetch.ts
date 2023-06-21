import { document } from "./patch-window";
import { writeFile } from "node:fs/promises";
import Calendar, { Props } from "react-activity-calendar";
import { cloneElement, createElement } from "react";
import { createRoot } from "react-dom/client";
import { providers } from "../src/utils/providers";
import { getAggregateContributions } from "./contributions";

const link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("href", "contributions.css");
document.head.appendChild(link);

const element = document.createElement("div");
document.body.appendChild(element);

function onLoad() {
	writeFile(
		"public/contributions.html",
		document.documentElement.outerHTML,
		"utf-8",
	);
}

async function main() {
	let data = await getAggregateContributions(providers);

	let props: Props = {
		data: data as Props["data"],
		theme: {
			light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
		},
		labels: {
			totalCount: `{{count}} contributions in the last year`,
		},
		colorScheme: "light",
		renderBlock: (element, activity) => {
			return cloneElement(element, {
				children: createElement("title", {
					children: `${activity.count} contributions on ${activity.date}`,
				}),
			});
		},
	};

	let reactElement = createElement(Calendar, props);
	createRoot(element as unknown as Element).render(
		createElement("div", { ref: onLoad }, reactElement),
	);
}

main().catch((error) => console.error(error));
