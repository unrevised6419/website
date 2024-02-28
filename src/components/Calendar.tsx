import { type FunctionComponent, cloneElement } from "react";
import RAC, { type Props } from "react-activity-calendar";
import data from "../data.json";

// @ts-expect-error library has a strange CJS export that changes on dev/prod
let ReactActivityCalendar: FunctionComponent<Props> = RAC.default ?? RAC;

export function Calendar() {
	return (
		<ReactActivityCalendar
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
