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
		<ul className="mx-auto grid grid-cols-3 gap-3 sm:grid-cols-4">
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
