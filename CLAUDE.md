# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio + blog at [all1n.dev](https://all1n.dev/), built with Astro 5 (static output) and deployed to GitHub Pages. Requires Node >=24 and npm >=11 (see `.nvmrc`).

## Commands

| Command                   | Action                                                                                                  |
| :------------------------ | :------------------------------------------------------------------------------------------------------ |
| `npm run dev`             | Local dev server                                                                                        |
| `npm run build`           | Full production build — runs `astro check && tsc --noEmit && astro build` (type-checks before building) |
| `npm run preview`         | Preview the built `./dist/` locally                                                                     |
| `npm run generate-resume` | Regenerate `public/resume.html` + `public/resume.pdf` from `public/resume.json`                         |
| `npm run astro -- <cmd>`  | Run Astro CLI directly                                                                                  |

There is **no test framework** in this repo — do not invent test commands. Verification is `npm run build` (which includes `astro check` + `tsc --noEmit`).

### Build lifecycle hooks (run automatically)

- `prebuild` → `generate-resume`: the resume PDF/HTML are regenerated on every build (rendered via `resumed` + `jsonresume-theme-even`, uses Puppeteer for the PDF).
- `postinstall` → `scripts/stats-fetch.ts`: fetches contribution data on install.

## Architecture

### Content collections (blog)

Blog posts are Markdown files in `/posts/` (named `YYYY-MM-DD-slug.md`), **not** under `src/`. They're loaded via Astro's content layer glob loader in `src/content.config.ts` with a Zod-validated frontmatter schema (`title`, `description`, `created_at`, optional `edited_at`/`published_at`). Pages: `src/pages/index.astro` lists posts; `src/pages/posts/[id].astro` renders one via `getStaticPaths`.

### Contributions calendar (the non-obvious part)

A GitHub-style activity calendar aggregating contributions across multiple git providers:

- **Data flow**: `scripts/stats-fetch.ts` → `getAggregateContributions()` in `scripts/contributions.ts` → writes `src/data.json` (gitignored, generated). The React island `src/components/Calendar.tsx` renders it.
- **Providers** are declared in `src/utils/providers.ts`. Each provider has a `type` (`github` | `gitlab`) mapped to a `Fetcher` in `scripts/contributions.ts` (`scripts/github.ts` scrapes the GitHub contributions HTML with Cheerio; `scripts/gitlab.ts` for GitLab).
- Aggregation sums per-day counts across providers, filters to the last year, and buckets into levels 0–4 (`getLevel`).
- To change which accounts show up, edit `providers` in `src/utils/providers.ts`, then re-run the fetch (`npx tsx scripts/stats-fetch.ts`).

### Generated / gitignored artifacts

`src/data.json`, `public/resume.html`, `public/resume.pdf`, `dist/`, `.astro/` are all generated — never hand-edit. Source of truth: `public/resume.json` (resume) and provider config (contributions).

### Rendering stack

- Astro with the React integration (`@astrojs/react`) — `.tsx` files are interactive islands.
- Tailwind CSS v4 via the Vite plugin (`@tailwindcss/vite`), not a separate config file; global styles in `src/styles/global.css`.
- `@playform/inline` inlines CSS into `dist/index.html` at build time.
- TypeScript uses `astro/tsconfigs/strictest` + `@total-typescript/ts-reset`.

## Writing blog posts

Posts originated as a dev.to export (see `scripts/dev-migrate.ts`), and follow a consistent house style. When creating or editing a post in `/posts/`, match it:

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
- **Pre-commit** runs `lint-staged`: Prettier on everything, plus `scripts/l10n-sort.ts` to sort `scripts/contributions/*.json` localization files by key.
- Formatting is Prettier with `@allindevelopers/prettier-config` + Astro and Tailwind plugins. Code style here uses tabs and `let` over `const` for locals — match the surrounding style.
