import type {
	FileProvider,
	Provider,
	PublicProvider,
} from "../../scripts/contributions";

let publicProviders: PublicProvider[] = [
	{
		id: "github-unrevised6419",
		access: "public",
		name: "GitHub",
		type: "github",
		username: "unrevised6419",
		origin: "https://github.com",
	},
	{
		id: "gitlab-covenant3195",
		access: "public",
		name: "GitLab",
		type: "gitlab",
		username: "covenant3195",
		origin: "https://gitlab.com",
	},
];

let fileProviders: FileProvider[] = [
	{
		id: "gitlab-jagaad",
		access: "file",
		name: "GitLab Jagaad",
		type: "gitlab",
	},
	{
		id: "gitlab-lm",
		access: "file",
		name: "GitLab LM",
		type: "gitlab",
	},
];

export let providers: Provider[] = [...publicProviders, ...fileProviders];
