import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import data from "../data.json";

export function Calendar() {
	return (
		<ActivityCalendar
			data={data}
			theme={{
				light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
			}}
			colorScheme="light"
			tooltips={{
				activity: {
					text: (activity) =>
						`${activity.count} contributions on ${activity.date}`,
				},
			}}
			showColorLegend={false}
			showTotalCount={false}
		/>
	);
}
