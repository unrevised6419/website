import { argv } from "node:process";
import { resolve } from "node:path";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const files = argv.slice(2);

const existingFiles = files
	.map((file) => resolve(file))
	.filter((path) => {
		const exists = existsSync(path);
		if (!exists) console.warn("File does not exist:", path);
		return exists;
	});

existingFiles.forEach((path) => {
	console.log("Sorting:", path);
	const strings = JSON.parse(readFileSync(path, "utf8"));
	const entries = Object.entries(strings);
	const sortedEntries = entries.sort(([a], [b]) => a.localeCompare(b));
	const sortedStrings = Object.fromEntries(sortedEntries);
	const content = JSON.stringify(sortedStrings, null, "\t");
	writeFileSync(path, `${content}\n`);
});
