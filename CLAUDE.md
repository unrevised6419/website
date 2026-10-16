# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio + blog at [all1n.dev](https://all1n.dev/), built with Astro 5 (static output) and deployed to GitHub Pages. Requires Node >=24 and pnpm >=11 (see `.nvmrc`).

## Commands

| Command                   | Action                                                                                                  |
| :------------------------ | :------------------------------------------------------------------------------------------------------ |
| `pnpm run dev`            | Local dev server                                                                                        |
| `pnpm run build`          | Full production build — runs `astro check && tsc --noEmit && astro build` (type-checks before building) |
| `pnpm run preview`        | Preview the built `./dist/` locally                                                                     |
| `pnpm run astro -- <cmd>` | Run Astro CLI directly                                                                                  |

There is **no test framework** in this repo — do not invent test commands. Verification is `pnpm run build` (which includes `astro check` + `tsc --noEmit`).

## Architecture

### Content collections (blog)

Blog posts are Markdown files in `/posts/` (named `YYYY-MM-DD-slug.md`), **not** under `src/`. They're loaded via Astro's content layer glob loader in `src/content.config.ts` with a Zod-validated frontmatter schema (`title`, `description`, `created_at`, `og_title`, `og_description`, optional `edited_at`/`published_at`). Pages: `src/pages/index.astro` lists posts; `src/pages/posts/[id].astro` renders one via `getStaticPaths`.

### Generated / gitignored artifacts

`dist/` and `.astro/` are generated — never hand-edit.

### Rendering stack

- Pure Astro — there is no UI framework integration. React and `@heroicons/react` were removed once the last component using them went away; don't reach for `.tsx` islands or React-only icon packages without adding the integration back first.
- Tailwind CSS v4 via the Vite plugin (`@tailwindcss/vite`), not a separate config file; global styles in `src/styles/global.css`.
- `@playform/inline` inlines CSS into `dist/index.html` at build time.
- TypeScript uses `astro/tsconfigs/strictest` + `@total-typescript/ts-reset`.

## Writing blog posts

Posts originated as a dev.to export and follow a consistent house style. When creating or editing a post in `/posts/`, match it:

**File & frontmatter**

- Filename: `YYYY-MM-DD-kebab-case-slug.md` (date = creation date).
- `title`: starts with a single leading emoji, e.g. `🩹 Migrate from patch-package to pnpm patch`.
- `description`: usually a folded scalar (`>-`) summarizing the takeaway in a sentence or two. It is rendered as `<meta name="description">`, `og:description` and `twitter:description` in `src/layouts/Layout.astro`, and as the subtitle in the post list, so keep it a clean standalone sentence. Do **not** prefix it with `tl;dr` (that belongs in the body blockquote), and do not paste truncated body text into it.
- `og_title` (required): the title used for `<title>`, `og:title` and `twitter:title`, at most 60 characters. Same as `title` unless that is longer. The heading, post list and OG image still use `title`.
- `og_description` (required): the description used for `og:description` and `twitter:description`, which social previews truncate, at most 125 characters. Same as `description` unless that is longer. Search results and the post list still use `description`.
- **Lengths are enforced** by the schema in `src/content.config.ts`, so `pnpm run build` fails when they are off: `og_title` at most 60 characters, `description` 120–160 and `og_description` at most 125. Avoid straight quotes (`'`, `"`) in descriptions: some meta-tag inspectors cut the value off at them.
- `created_at` / `published_at` / optional `edited_at`: quoted ISO-8601 timestamps.
- `tags`: a comma-separated string is conventionally present, **but is not in the collection schema** (`src/content.config.ts`) and is ignored by the site. Don't add schema-unknown fields expecting them to render; only `title`/`og_title`/`description`/`og_description`/dates are used.

**Body structure**

- Every new post **must** open with a short intro paragraph that the author copies as the excerpt when cross-posting to other platforms (DEV, Hashnode, Medium, LinkedIn) and links back to the full post. It is a hook, not a summary: 2–4 sentences of plain prose that set up the problem or the surprise and make the reader want the answer, **without revealing the solution**. It must read fine on its own, without the title or the rest of the post: no code blocks, images, tables or links to sections of the post; inline backticked identifiers and external links are fine, but links to other posts must be absolute (`https://all1n.dev/posts/...`) so they still work when cross-posted.
- Follow the intro with a `> **tl;dr** ...` blockquote, frequently followed immediately by the final solution (code/alias) before any explanation — answer first, explain after. The tl;dr is only for readers already on the site, so it does give the answer; never use it as the external excerpt. Only some older posts have one, but every new post **must**.
- Number multi-step procedures with `####` headings (`#### 1. ...`).
- Use blockquote callouts prefixed with an emoji for asides: `> 💡 ...`, `> 📝 ...`, `> ⚠️ ...`.
- Always language-tag code fences (`bash`, `shell`, `jsx`, `js`, `ts`, `text`, `properties`); show command output in a separate `text` fence after the command.
- Tone is casual and second-person ("you", "let's"), with liberal emoji and the occasional reaction GIF/image.
- Link generously to docs, issues, and source repos via inline Markdown links and backticked identifiers.
- Close with a sign-off line ("Thanks for reading my blog posts! 🎉") and, when applicable, a credit/source link below a `---` rule.

## Conventions

- **Commits** must follow Conventional Commits — enforced by commitlint via the Husky `commit-msg` hook.
- **Pre-commit** runs `lint-staged`: Prettier on everything.
- Formatting is Prettier with `@all1ndev/prettier-config` + Astro and Tailwind plugins. Code style here uses tabs and `let` over `const` for locals — match the surrounding style.
