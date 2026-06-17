import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

// Open Graph image dimensions (the de-facto 1.91:1 standard).
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const AUTHOR_NAME = "All In Developer";
const SITE_LABEL = "all1n.dev";

// Resolve build-time assets from the project root. The build runs with the
// repo root as the working directory, so this is stable in both `dev` and
// `build` (unlike import.meta.url, which Vite rewrites during SSR).
let root = process.cwd();
let fontDir = path.join(root, "node_modules/@fontsource/inter/files");

// Satori needs raw font data — it can't use system fonts. Inter ships .woff
// files (Satori supports ttf/otf/woff, but not woff2).
async function loadFonts() {
	let [regular, bold] = await Promise.all([
		readFile(path.join(fontDir, "inter-latin-400-normal.woff")),
		readFile(path.join(fontDir, "inter-latin-700-normal.woff")),
	]);
	return [
		{
			name: "Inter",
			data: regular,
			weight: 400 as const,
			style: "normal" as const,
		},
		{
			name: "Inter",
			data: bold,
			weight: 700 as const,
			style: "normal" as const,
		},
	];
}

// Pre-shrink the avatar to a small PNG and inline it as a data URI so Satori
// can embed it without a network fetch.
async function loadAvatarDataUri() {
	let buffer = await readFile(path.join(root, "public/allindeveloper.png"));
	let png = await sharp(buffer).resize(160, 160).png().toBuffer();
	return `data:image/png;base64,${png.toString("base64")}`;
}

// Cache the assets — they're identical across every post, so we only pay for
// font reads and the avatar resize once per build.
let fontsPromise: ReturnType<typeof loadFonts> | undefined;
let avatarPromise: Promise<string> | undefined;

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

// Inter has no emoji glyphs, and every post title opens with one. Satori
// renders emoji via the `loadAdditionalAsset` hook: we map each emoji to its
// Twemoji color SVG. Cached per codepoint; a fetch failure drops the emoji
// rather than failing the build.
const emojiCache = new Map<string, string>();

// Twemoji's codepoint rule: strip the FE0F variation selector unless the
// sequence is a ZWJ sequence (which needs every codepoint to match a filename).
function toTwemojiCodepoint(emoji: string) {
	let source = emoji.includes("‍") ? emoji : emoji.replace(/️/g, "");
	return Array.from(source)
		.map((char) => char.codePointAt(0)!.toString(16))
		.join("-");
}

async function loadEmojiSvg(emoji: string): Promise<string> {
	let codepoint = toTwemojiCodepoint(emoji);
	let cached = emojiCache.get(codepoint);
	if (cached !== undefined) return cached;

	let dataUri = "";
	try {
		let res = await fetch(
			`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${codepoint}.svg`,
		);
		if (res.ok) {
			let svg = await res.text();
			dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
		}
	} catch {
		// Offline or CDN down — leave the emoji out instead of breaking the build.
	}
	emojiCache.set(codepoint, dataUri);
	return dataUri;
}

interface OgOptions {
	title: string;
	date: Date;
	tags?: string[];
}

function markup({ title, date, tags = [] }: OgOptions) {
	let tagRow =
		tags.length > 0
			? `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:32px;">
					${tags
						.slice(0, 4)
						.map(
							(tag) =>
								`<div style="display:flex;padding:8px 20px;border-radius:9999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);font-size:24px;color:#bbf7d0;">#${escapeHtml(tag)}</div>`,
						)
						.join("")}
				</div>`
			: "";

	return html(`
		<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:70px;background:linear-gradient(135deg,#052e16 0%,#064e3b 60%,#065f46 100%);font-family:Inter;color:#ffffff;">
			<div style="display:flex;align-items:center;font-size:28px;font-weight:700;color:#6ee7b7;letter-spacing:0.5px;">
				${escapeHtml(SITE_LABEL)}
			</div>
			<div style="display:flex;flex-direction:column;">
				<div style="display:flex;font-size:64px;font-weight:700;line-height:1.1;max-height:280px;overflow:hidden;">
					${escapeHtml(title)}
				</div>
				${tagRow}
			</div>
			<div style="display:flex;align-items:center;justify-content:space-between;">
				<div style="display:flex;align-items:center;">
					<img src="${AVATAR_PLACEHOLDER}" style="width:84px;height:84px;border-radius:9999px;border:2px solid rgba(255,255,255,0.2);" />
					<div style="display:flex;font-size:32px;font-weight:700;margin-left:24px;">${escapeHtml(AUTHOR_NAME)}</div>
				</div>
				<div style="display:flex;font-size:28px;color:#a7f3d0;">${escapeHtml(formatDate(date))}</div>
			</div>
		</div>
	`);
}

// satori-html parses the avatar `src` eagerly, so we substitute the (large)
// data URI into the rendered tree after templating rather than inlining it
// into the template string.
const AVATAR_PLACEHOLDER = "__AVATAR__";

function injectAvatar(node: any, dataUri: string) {
	if (node && typeof node === "object") {
		if (node.props?.src === AVATAR_PLACEHOLDER) {
			node.props.src = dataUri;
		}
		let children = node.props?.children;
		if (Array.isArray(children)) {
			for (let child of children) injectAvatar(child, dataUri);
		} else if (children) {
			injectAvatar(children, dataUri);
		}
	}
}

export async function renderOgImage(options: OgOptions): Promise<Buffer> {
	fontsPromise ??= loadFonts();
	avatarPromise ??= loadAvatarDataUri();
	let [fonts, avatar] = await Promise.all([fontsPromise, avatarPromise]);

	let tree = markup(options);
	injectAvatar(tree, avatar);

	// satori-html returns its own VNode type; satori's signature wants a
	// ReactNode. They're structurally compatible at runtime.
	let svg = await satori(tree as Parameters<typeof satori>[0], {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		fonts,
		loadAdditionalAsset: async (code, segment) => {
			if (code === "emoji") return loadEmojiSvg(segment);
			return code;
		},
	});

	// The gradient is a smooth vector, but flattening to an 8-bit PNG
	// posterizes it into visible bands. Overlay faint gaussian noise to
	// dither those steps away (mid-gray noise + "overlay" blend leaves the
	// base color intact and only perturbs each pixel by a hair).
	let noise = await sharp({
		create: {
			width: OG_WIDTH,
			height: OG_HEIGHT,
			channels: 3,
			background: { r: 0, g: 0, b: 0 },
			noise: { type: "gaussian", mean: 128, sigma: 8 },
		},
	})
		.png()
		.toBuffer();

	return sharp(Buffer.from(svg))
		.composite([{ input: noise, blend: "overlay" }])
		.png()
		.toBuffer();
}
