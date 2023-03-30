<template>
	<div class="rounded-2xl bg-white p-10 text-center shadow-2xl">
		<Picture
			src="https://gravatar.com/avatar/3d8d36a4c7e54969b9659a9f46d2f392?size=512"
			class="mx-auto mb-5 h-32 w-32 rounded-full shadow-xl"
			alt="My profile picture"
		/>
		<h1 class="mb-3 text-3xl">Andrew Luca</h1>
		<span class="rounded bg-gray-200 px-3 py-2 text-sm">
			❤️&nbsp;&nbsp;<code>All In Developer</code>
		</span>
		<hr class="my-5" />
		<ul class="flex max-w-xs flex-wrap justify-center gap-2">
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
import IconInstagram from "@/components/icons/IconInstagram.vue";
import IconOnlyFans from "@/components/icons/IconOnlyFans.vue";
import IconMastodon from "@/components/icons/IconMastodon.vue";
import IconGitLab from "@/components/icons/IconGitLab.vue";

let socials = [
	{
		url: "/twitter",
		title: "Twitter",
		icon: IconTwitter,
	},
	{
		url: "/mastodon",
		title: "Mastodon",
		icon: IconMastodon,
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
		url: "/gitlab",
		title: "GitLab",
		icon: IconGitLab,
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
	{
		url: "/instagram",
		title: "Instagram",
		icon: IconInstagram,
	},
	{
		url: "/onlyfans",
		title: "OnlyFans",
		icon: IconOnlyFans,
	},
];
</script>
