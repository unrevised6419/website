<template>
	<div class="overflow-x-auto rounded-2xl bg-white shadow-2xl">
		<div class="min-h-[259px] min-w-[924px] p-10">
			<div ref="contributionsGraphRef" />
			<div class="text-sm">
				<span>Data from:</span>
				<ul class="ml-1 inline-flex gap-1">
					<li v-for="(provider, index) in providers">
						<a
							:href="`${provider.origin}/${provider.username}`"
							target="_blank"
							rel="noopener"
							class="text-blue-800"
						>
							{{ provider.name }}
						</a>
						<span v-if="index < providers.length - 1">,</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { cloneElement, createElement } from "react";
import Calendar, { Props } from "react-activity-calendar";
import data from "../data.json";
import { createRoot } from "react-dom/client";
import { providers } from "~/utils/providers";

let contributionsGraphRef = ref();

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

let element = createElement(Calendar, props);

onMounted(() => {
	let root = createRoot(contributionsGraphRef.value);
	root.render(element);
});
</script>
