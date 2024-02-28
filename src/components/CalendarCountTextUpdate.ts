import { useEffect } from "react";

export function CalendarCountTextUpdate() {
	useEffect(() => {
		let selector = ".react-activity-calendar__count";
		let element = globalThis.document.querySelector(selector);
		let textContent = element?.textContent;

		if (!element || !textContent) return;

		let count = Number.parseInt(textContent);
		let countPerDay = Math.round(count / 365);

		let html = String.raw;

		element.innerHTML = html`
			<span>${textContent}</span>
			<span class="animate-fade-down animate-delay-1000">
				Almost ${countPerDay} per day 🚀
			</span>
		`;

		return () => {
			if (!element || !textContent) return;
			element.textContent = textContent;
		};
	}, []);
}
