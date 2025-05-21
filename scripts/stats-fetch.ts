import { writeFile } from "node:fs/promises";
import { providers } from "../src/utils/providers";
import { getAggregateContributions } from "./contributions";

async function main() {
	let data = await getAggregateContributions(providers);
	await writeFile("src/data.json", JSON.stringify(data, null, "\t"), "utf-8");
}

main().catch((error) => console.error(error));
