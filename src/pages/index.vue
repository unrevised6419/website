<template>
	<div>
		<div
			class="mb-5 grid grid-cols-1 rounded-2xl bg-white p-10 shadow-2xl md:grid-cols-3"
		>
			<div class="border-b p-5 text-center md:border-b-0 md:border-r">
				<Picture
					src="https://gravatar.com/avatar/3d8d36a4c7e54969b9659a9f46d2f392?size=512"
					class="mx-auto mb-5 h-32 w-32 rounded-full shadow-xl"
					alt="My profile picture"
				/>
				<h1 class="mb-3 text-3xl">Andrew Luca</h1>
				<span class="inline-block rounded bg-gray-200 px-3 py-2 text-sm">
					❤️&nbsp;&nbsp;<code>All In Developer</code>
				</span>
			</div>
			<div class="col-span-2 flex items-center p-5">
				<Socials />
			</div>
		</div>
		<Contributions client:load />
	</div>
</template>

<script lang="ts" setup>
import Socials from "~/components/Socials.vue";
import Contributions from "~/components/Contributions.vue";
</script>
