<template>
	<ul class="mx-auto flex max-w-xs flex-wrap justify-center gap-2">
		<li v-for="social in socials" :key="social.url">
			<a
				:href="social.url"
				:title="social.title"
				class="flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
			>
				<component :is="social.icon" class="m-2.5 h-6 w-6 text-gray-600" />
			</a>
		</li>
	</ul>
</template>

<script setup lang="ts">
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
import IconBlueSky from "@/components/icons/IconBlueSky.vue";

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
		url: "/bluesky",
		title: "BlueSky",
		icon: IconBlueSky,
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
