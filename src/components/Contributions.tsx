import { providers } from "../utils/providers";
import { intersperse } from "../utils";
import type { ReactNode } from "react";

type ContributionsProps = {
	children: ReactNode;
};

export function Contributions({ children: calendar }: ContributionsProps) {
	let providersElements = providers.map((provider) => (
		<li key={provider.id}>
			{provider.access === "public" && (
				<a
					href={`${provider.origin}/${provider.username}`}
					target="_blank"
					rel="noopener"
					className="text-blue-800 underline"
				>
					{provider.name}
				</a>
			)}

			{provider.access === "file" && (
				<span className="cursor-not-allowed text-blue-800">
					{provider.name}
				</span>
			)}
		</li>
	));

	let dividerElement = (index: number) => (
		<li key={`s-${index}`} className="-ml-1">
			,
		</li>
	);

	return (
		<div className="overflow-x-auto rounded-2xl bg-white shadow-2xl">
			<div className="min-h-[259px] min-w-[924px] p-10">
				{calendar}

				<div className="text-sm">
					<span>Sources:</span>
					<ul className="ml-1 inline-flex gap-1">
						{intersperse(providersElements, dividerElement)}
					</ul>
				</div>
			</div>
		</div>
	);
}
