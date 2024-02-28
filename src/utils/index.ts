export let avatarUrl = `https://gravatar.com/avatar/3d8d36a4c7e54969b9659a9f46d2f392?size=256`;

type TypeOrFunction<T> = T | ((index: number) => T);

export let intersperse = <T>(a: T[], s: TypeOrFunction<T>): T[] => {
	return [...Array(2 * a.length - 1)].map((_, i) => {
		let sep = typeof s === "function" ? s : () => s;
		// @ts-ignore
		return i % 2 ? sep(i) : a[i / 2];
	});
};
