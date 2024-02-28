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
	{
		id: "gitlab-jagaad",
		access: "public",
		name: "GitLab Jagaad",
		type: "gitlab",
		username: "iamandrewluca",
		origin: "https://git.jagaad.com",
	},
];

let fileProviders: FileProvider[] = [
	{
		id: "gitlab-private-1",
		access: "file",
		name: "GitLab Private 1",
		type: "gitlab",
	},
];

export let providers: Provider[] = [...publicProviders, ...fileProviders];
