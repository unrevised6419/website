<template>
	<div class="rounded-2xl bg-white p-10 text-center shadow-2xl">
		<Picture
			src="@/assets/me.jpg?preset=profile"
			class="mx-auto mb-5 h-32 w-32 rounded-full shadow-xl"
			alt="My profile picture"
		/>
		<h1 class="mb-3 text-3xl">Andrew Luca</h1>
		<code class="rounded bg-gray-200 p-1 text-sm">All In Developer</code>
		<hr class="my-5" />
		<ul class="flex flex-wrap justify-center gap-3">
			<li v-for="social in socials" :key="social.url">
				<a
					:href="social.url"
					:title="social.title"
					class="flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
				>
					<component :is="social.icon" class="m-2.5 h-5 w-5 text-gray-600" />
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import IconTwitter from "../components/icons/IconTwitter.vue";
import IconYouTube from "../components/icons/IconYouTube.vue";
import IconGitHub from "../components/icons/IconGitHub.vue";
import IconLinkedin from "../components/icons/IconLinkedin.vue";
import IconDev from "../components/icons/IconDev.vue";
import IconTelegram from "../components/icons/IconTelegram.vue";

let socials = [
	{
		url: "/twitter",
		title: "Twitter",
		icon: IconTwitter,
	},
	{
		url: "/youtube",
		title: "YouTube",
		icon: IconYouTube,
	},
	{
		url: "/github",
		title: "GitHub",
		icon: IconGitHub,
	},
	{
		url: "/linkedin",
		title: "Linkedin",
		icon: IconLinkedin,
	},
	{
		url: "/dev",
		title: "Dev",
		icon: IconDev,
	},
	{
		url: "/telegram",
		title: "Telegram",
		icon: IconTelegram,
	},
];
</script>
