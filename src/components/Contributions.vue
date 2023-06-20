<template>
	<div class="overflow-x-auto rounded-2xl bg-white shadow-2xl">
		<div class="min-h-[259px] min-w-[924px] p-10">
			<iframe src="/contributions.html" class="min-h-[160px] w-full" />
			<div class="text-sm">
				<span>Sources:</span>
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
import { providers } from "~/utils/providers";
</script>
