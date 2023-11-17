import { IconTwitter } from "../components/icons/IconTwitter";
import { IconYouTube } from "../components/icons/IconYouTube";
import { IconGitHub } from "../components/icons/IconGitHub";
import { IconLinkedin } from "../components/icons/IconLinkedin";
import { IconDev } from "../components/icons/IconDev";
import { IconTelegram } from "../components/icons/IconTelegram";
import { IconOnlyFans } from "./icons/IconOnlyFans";
import { IconGitLab } from "./icons/IconGitLab";

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
		url: "/onlyfans",
		title: "OnlyFans",
		icon: IconOnlyFans,
	},
];

export function Socials() {
	return (
		<ul className="mx-auto flex max-w-md flex-wrap justify-center gap-4">
			{socials.map((social) => (
				<li key={social.url} className="w-full sm:w-32">
					<a
						href={social.url}
						title={social.title}
						className="flex w-full items-center justify-center gap-1 rounded-full bg-gray-200 px-3 py-2 hover:bg-green-300"
					>
						<social.icon className="h-6 w-6 shrink-0 text-gray-600" />
						<span className="text-sm">{social.title}</span>
					</a>
				</li>
			))}
		</ul>
	);
}
