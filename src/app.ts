import "tailwindcss/tailwind.css";
import { defineApp } from "iles";

export default defineApp({
	head: {
		link: [{ href: "/favicon.png", type: "image/png", rel: "icon" }],
		script: [{ src: "https://cdn.splitbee.io/sb.js", defer: true }],
	},
});
