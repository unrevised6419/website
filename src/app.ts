import "tailwindcss/tailwind.css";
import { defineApp } from "iles";

export default defineApp({
	head: {
		link: [
			{ href: "/favicon.png", type: "image/png", rel: "icon" },
			{ href: "https://fosstodon.org/@iamandrewluca", rel: "me" },
			{ href: "https://mstdn.md/@iamandrewluca", rel: "me" },
		],
		script: [{ src: "https://cdn.splitbee.io/sb.js", defer: true }],
	},
});
