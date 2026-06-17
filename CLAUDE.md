# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio + blog at [all1n.dev](https://all1n.dev/), built with Astro 5 (static output) and deployed to GitHub Pages. Requires Node >=24 and npm >=11 (see `.nvmrc`).

## Commands

| Command                  | Action                                                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------------------------ |
| `npm run dev`            | Local dev server                                                                                        |
| `npm run build`          | Full production build — runs `astro check && tsc --noEmit && astro build` (type-checks before building) |
| `npm run preview`        | Preview the built `./dist/` locally                                                                     |
| `npm run astro -- <cmd>` | Run Astro CLI directly                                                                                  |

There is **no test framework** in this repo — do not invent test commands. Verification is `npm run build` (which includes `astro check` + `tsc --noEmit`).

## Architecture

### Content collections (blog)

Blog posts are Markdown files in `/posts/` (named `YYYY-MM-DD-slug.md`), **not** under `src/`. They're loaded via Astro's content layer glob loader in `src/content.config.ts` with a Zod-validated frontmatter schema (`title`, `description`, `created_at`, optional `edited_at`/`published_at`). Pages: `src/pages/index.astro` lists posts; `src/pages/posts/[id].astro` renders one via `getStaticPaths`.

### Generated / gitignored artifacts

`dist/` and `.astro/` are generated — never hand-edit.

### Rendering stack

- Astro with the React integration (`@astrojs/react`) — `.tsx` files would be interactive islands; React is also used to render `@heroicons/react` components inside `.astro` files.
- Tailwind CSS v4 via the Vite plugin (`@tailwindcss/vite`), not a separate config file; global styles in `src/styles/global.css`.
- `@playform/inline` inlines CSS into `dist/index.html` at build time.
- TypeScript uses `astro/tsconfigs/strictest` + `@total-typescript/ts-reset`.

## Writing blog posts

Posts originated as a dev.to export and follow a consistent house style. When creating or editing a post in `/posts/`, match it:

**File & frontmatter**

- Filename: `YYYY-MM-DD-kebab-case-slug.md` (date = creation date).
- `title`: starts with a single leading emoji, e.g. `🩹 Migrate from patch-package to pnpm patch`.
- `description`: usually a folded scalar (`>-`) that opens with `tl;dr` and summarizes the takeaway.
- `created_at` / `published_at` / optional `edited_at`: quoted ISO-8601 timestamps.
- `tags`: a comma-separated string is conventionally present, **but is not in the collection schema** (`src/content.config.ts`) and is ignored by the site. Don't add schema-unknown fields expecting them to render; only `title`/`description`/dates are used.

**Body structure**

- Open with a `> **tl;dr** ...` blockquote, frequently followed immediately by the final solution (code/alias) before any explanation — answer first, explain after.
- Number multi-step procedures with `####` headings (`#### 1. ...`).
- Use blockquote callouts prefixed with an emoji for asides: `> 💡 ...`, `> 📝 ...`, `> ⚠️ ...`.
- Always language-tag code fences (`bash`, `shell`, `jsx`, `js`, `ts`, `text`, `properties`); show command output in a separate `text` fence after the command.
- Tone is casual and second-person ("you", "let's"), with liberal emoji and the occasional reaction GIF/image.
- Link generously to docs, issues, and source repos via inline Markdown links and backticked identifiers.
- Close with a sign-off line ("Thanks for reading my blog posts! 🎉") and, when applicable, a credit/source link below a `---` rule.

## Conventions

- **Commits** must follow Conventional Commits — enforced by commitlint via the Husky `commit-msg` hook.
- **Pre-commit** runs `lint-staged`: Prettier on everything.
- Formatting is Prettier with `@allindevelopers/prettier-config` + Astro and Tailwind plugins. Code style here uses tabs and `let` over `const` for locals — match the surrounding style.
