import { writeFile } from "node:fs/promises";
import { getAggregateContributions } from "./contributions";
import { providers } from "../src/utils/providers";

async function main() {
	let result = await getAggregateContributions(providers);
	await writeFile("src/data.json", JSON.stringify(result), "utf-8");
}

main().catch((error) => console.error(error));

// fetch("https://git.jagaad.com/users/iamandrewluca/calendar.json")
// 	.then((response) => response.text())
// 	.then((data) => console.log(data));
