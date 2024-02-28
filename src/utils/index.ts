export let avatarUrl = `https://gravatar.com/avatar/3d8d36a4c7e54969b9659a9f46d2f392?size=256`;

export let intersperse = <T>(a: T[], s: T): T[] => {
	// @ts-ignore
	return [...Array(2 * a.length - 1)].map((_, i) => (i % 2 ? s : a[i / 2]));
};
