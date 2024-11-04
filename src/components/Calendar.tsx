import { cloneElement } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import data from "../data.json";

export function Calendar() {
	return (
		<ActivityCalendar
			data={data}
			theme={{
				light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
			}}
			labels={{
				totalCount: `{{count}} contributions in the last year 😱`,
			}}
			colorScheme="light"
			renderBlock={(element, activity) => {
				// Do not inline `title`
				// Warning: A title element received an array with more than 1 element as children.
				let title = `${activity.count} contributions on ${activity.date}`;
				return cloneElement(element, {}, <title>{title}</title>);
			}}
		/>
	);
}
