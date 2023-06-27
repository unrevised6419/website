import { type FunctionComponent, cloneElement } from "react";
import RAC, { type Props } from "react-activity-calendar";
import { providers } from "../utils/providers";
import data from "../data.json";

// @ts-expect-error library has a strange CJS export that changes on dev/prod
let Calendar: FunctionComponent<Props> = RAC.default ?? RAC;

export function Contributions() {
	return (
		<div className="overflow-x-auto rounded-2xl bg-white shadow-2xl">
			<div className="min-h-[259px] min-w-[924px] p-10">
				<Calendar
					data={data as any}
					theme={{
						light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
					}}
					labels={{
						totalCount: `{{count}} contributions in the last year`,
					}}
					colorScheme="light"
					renderBlock={(element, activity) => {
						// Do not inline `title`
						// Warning: A title element received an array with more than 1 element as children.
						let title = `${activity.count} contributions on ${activity.date}`;
						return cloneElement(element, {}, <title>{title}</title>);
					}}
				/>

				<div className="text-sm">
					<span>Sources:</span>
					<ul className="ml-1 inline-flex gap-1">
						{providers.map((provider, index) => (
							<li key={index}>
								<a
									href={`${provider.origin}/${provider.username}`}
									target="_blank"
									rel="noopener"
									className="text-blue-800"
								>
									{provider.name}
								</a>
								{index < providers.length - 1 && <span>,</span>}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
