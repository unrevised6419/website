import type {
	FileProvider,
	Provider,
	PublicProvider,
} from "../../scripts/contributions";

let publicProviders: PublicProvider[] = [
	{
		id: "github-iamandrewluca",
		access: "public",
		name: "GitHub",
		type: "github",
		username: "iamandrewluca",
		origin: "https://github.com",
	},
	{
		id: "gitlab-iamandrewluca",
		access: "public",
		name: "GitLab",
		type: "gitlab",
		username: "iamandrewluca",
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
