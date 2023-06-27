import { IconTwitter } from "../components/icons/IconTwitter";
import { IconYouTube } from "../components/icons/IconYouTube";
import { IconGitHub } from "../components/icons/IconGitHub";
import { IconLinkedin } from "../components/icons/IconLinkedin";
import { IconDev } from "../components/icons/IconDev";
import { IconTelegram } from "../components/icons/IconTelegram";
import { IconInstagram } from "./icons/IconInstagram";
import { IconOnlyFans } from "./icons/IconOnlyFans";
import { IconMastodon } from "./icons/IconMastodon";
import { IconGitLab } from "./icons/IconGitLab";
import { IconBlueSky } from "./icons/IconBlueSky";

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

export function Socials() {
	return (
		<ul className="mx-auto flex max-w-xs flex-wrap justify-center gap-2">
			{socials.map((social) => (
				<li key={social.url}>
					<a
						href={social.url}
						title={social.title}
						className="flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
					>
						<social.icon className="m-2.5 h-6 w-6 text-gray-600" />
					</a>
				</li>
			))}
		</ul>
	);
}
