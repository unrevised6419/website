---
title: 🐳 Slimming a production Strapi 5 Docker image from 3.2 GB to 867 MB
description: >-
    Most of a production Strapi image is the admin panel's build toolchain and
    frontend libraries, which the server never loads once the panel is built.
    Deploy only the app, override away webpack, and delete the rest from the
    deploy output.
tags: strapi, docker, pnpm, node
created_at: "2026-10-04T09:00:00.000Z"
published_at: "2026-10-04T10:00:00.000Z"
edited_at: "2026-10-04T06:06:46.000Z"
---

> **tl;dr** `pnpm deploy --prod` only the Strapi app, drop the webpack bundler with pnpm `overrides`, then delete source maps, `.d.ts` files, `dist/admin` and the admin panel's frontend libraries from the deploy output in the same Docker stage. Boot-test the image after every Strapi upgrade. On a fresh npm app, the same approach takes the image from 1.25 GB to 731 MB.

|                                                                      | Uncompressed | Compressed (pushed / pulled) |
| -------------------------------------------------------------------- | ------------ | ---------------------------- |
| Whole monorepo copied in, `pnpm install --prod` at the root, pnpm 11 | 3.2 GB       | 516 MB                       |
| The same, after upgrading to pnpm 12                                 | 2.93 GB      | 481 MB                       |
| `pnpm deploy --prod` of the Strapi app only                          | 1.68 GB      | 266 MB                       |
| After the steps below                                                | **867 MB**   | **160 MB**                   |

We run Strapi 5.56 (TypeScript, Postgres, a pnpm monorepo, a few custom plugins) in a Debian `node:24-bookworm-slim` image. Built the obvious way, the image was 3.2 GB 😱. Here's what we removed, how, and what has to stay.

> 📝 Every number in this post was measured on 2026-10-04, on arm64, with Docker 29, Strapi 5.56, Node 24 and pnpm 12. Every image was boot-tested against Postgres: admin panel, REST, GraphQL and plugin routes. The [plain npm app](#what-about-a-plain-npm-app) further down has its own setup.

The base image (Debian + Node 24) is about 268 MB of that. The rest is the app, and almost all of the app is `node_modules`.

Inside the app, with the monorepo installed at the root just before step 1 (a 2.78 GB image by then, after a few unrelated repo changes) and after every step below:

|                                                | Before   | After                               |
| ---------------------------------------------- | -------- | ----------------------------------- |
| App layer                                      | 2.05 GB  | 439 MB                              |
| `node_modules`                                 | 1,880 MB | 403 MB                              |
| Source maps                                    | 472 MB   | 0                                   |
| `.d.ts` files                                  | 187 MB   | 0                                   |
| Markdown and unbuilt `.ts` sources             | 69 MB    | 0                                   |
| Repo files (other apps, build cache, lockfile) | 74 MB    | 16 MB (the app's `dist` + lockfile) |
| Packages in `node_modules/.pnpm`               | 3,041    | 1,551                               |

## Why a Strapi image is big

The admin panel is a React app, and `strapi build` bundles it into `dist/build`. Once that's done, the server never loads the libraries the admin panel was built from. But Strapi's packages declare all of them as `dependencies`, so every production install keeps them:

- the admin build toolchain: webpack and its loaders, vite, esbuild, swc, lightningcss, babel (about 150 MB). `@strapi/strapi` declares webpack as a dependency even though vite is the default bundler;
- the admin panel's frontend libraries: React, `styled-components`, the design system, codemirror, the Mux video player and `hls.js`, redux, formik, react-router and more (about 150 MB);
- each `@strapi/*` package's prebuilt admin code in `dist/admin`, next to the `dist/server` the server actually runs (about 57 MB);
- [`typedoc`](https://typedoc.org/) and its markdown plugins, which `@strapi/types` declares as `dependencies` (about 18 MB);
- source maps, `.d.ts` files, markdown, and unbuilt `.ts` sources that packages publish (about 380 MB in total).

### 0. Upgrade pnpm

Upgrading pnpm from 11.26 to 12.8, and re-resolving the lockfile with it, took the image from 3.2 GB to 2.93 GB with no change to how it's built. Strapi's packages depend on each other with many optional peers (`@types/*`, `@strapi/types`), and pnpm installs a separate copy of a package for every distinct set of peers it resolves. The new lockfile has about half as many: `@strapi/admin` went from 12 copies to 6, `@strapi/core` from 6 to 3, and most other `@strapi/*` packages from 6 to 4.

> ⚠️ The upgrade also needed two small peer fixes in our manifests, so some of the saving may come from those rather than from pnpm itself.

If your image installs with pnpm, this shows how many copies you carry:

```bash
ls node_modules/.pnpm | grep '^@strapi+admin@'
```

### 1. Deploy only the Strapi app

If Strapi lives in a monorepo, don't copy the repo into the image. [`pnpm deploy`](https://pnpm.io/cli/deploy) writes one workspace package with its production dependencies into a standalone folder:

```dockerfile
RUN pnpm --filter <your-strapi-app> deploy --prod --ignore-scripts --prefer-offline /prod/cms
```

Two things to know:

- Strapi finds plugins through the app's `dependencies`. Declare your local plugins as `workspace:` dependencies of the app, and give each a `package.json#files` list so `deploy` copies its build output.
- If you use `useTypescriptMigrations`, Strapi parses `tsconfig.json` at boot and exits with `TS18003` when no file matches `include`. Keep the tsconfig, and any file it needs, in the app's `files`.

This is the step that brought us down to 1.68 GB. Most of that came from the other workspaces in the monorepo, so a single-app repo will start lower.

### 2. Keep webpack out of the install

`@strapi/strapi` declares its deprecated webpack bundler as `dependencies`. If you build with vite (the default), [pnpm `overrides`](https://pnpm.io/settings#overrides) can drop those edges. In `pnpm-workspace.yaml` (or under `pnpm.overrides` in `package.json`):

```yaml
overrides:
    "@strapi/strapi>@pmmmwh/react-refresh-webpack-plugin": "-"
    "@strapi/strapi>css-loader": "-"
    "@strapi/strapi>esbuild-loader": "-"
    "@strapi/strapi>fork-ts-checker-webpack-plugin": "-"
    "@strapi/strapi>html-webpack-plugin": "-"
    "@strapi/strapi>mini-css-extract-plugin": "-"
    "@strapi/strapi>style-loader": "-"
    "@strapi/strapi>webpack": "-"
    "@strapi/strapi>webpack-bundle-analyzer": "-"
    "@strapi/strapi>webpack-dev-middleware": "-"
    "@strapi/strapi>webpack-hot-middleware": "-"
```

> ⚠️ This applies to local installs too, so `strapi build --bundler=webpack` stops working. `strapi develop` and `strapi build` with vite are unaffected.

### 3. Delete what `strapi start` never loads

The rest can't be expressed as an override, because local development still needs it. So it's deleted from the deploy output, in the same Dockerfile stage that runs `pnpm deploy`:

```dockerfile
RUN node scripts/slim-deploy.mjs /prod/cms
```

> 💡 It has to be the same stage: deleting files in a later layer hides them without shrinking the image.

The script, in full, is [at the end of this post](#the-scripts). In order, it:

1. Deletes `dist/admin` from every `@strapi/*` package, plus the unbuilt `admin/`, `server/` and `documentation/` folders `@strapi/plugin-users-permissions` publishes.
2. Deletes source maps, `.d.ts`, `.ts`/`.tsx`, markdown, `__tests__`, and `test`/`docs`/`examples` folders at a package's root.
3. Removes every symlink to a build-only package: `@types/*`, an explicit list of admin frontend libraries, `typedoc` and its two plugins, and the SQLite driver if production runs Postgres.
4. Deletes every `.pnpm` store entry that is no longer reachable from `node_modules` by following symlinks. This is what actually frees the space: unlinking `react` makes `react-dom`, `scheduler` and everything else only React uses unreachable.

The frontend list is a reviewed list of names rather than something computed. We tried computing it from the built code and gave up: a regex misses `require.resolve`, `createRequire` and computed specifiers, and a miss is a crash in production on the first request down that path. With an explicit list, anything not on it is kept by default.

```text
react, react-dom, styled-components,
@strapi/design-system, @strapi/icons, @strapi/ui-primitives,
@mux/mux-player-react, codemirror, formik, prismjs,
react-dnd, react-dnd-html5-backend, react-helmet, react-intl,
react-query, react-redux, @reduxjs/toolkit,
react-router, react-router-dom, react-select, react-window
```

Most of these are `dependencies` of `@strapi/admin`, `content-manager`, `upload` and the other admin-contributing packages. `react`, `react-dom`, `react-router-dom` and `styled-components` are their peers, which Strapi's project template adds to the app's own `dependencies`. Add your own plugins' admin-only libraries to the list (for us: `lucide-react`, `recharts`, `@apollo/client`, `react-hook-form`, `react-error-boundary`).

#### The catch: `@strapi/admin` and `react` need a patch

Unpatched, `strapi start` crashes once `@strapi/admin/dist/admin` or `react` is gone:

```text
Cannot find module './admin/src/components/DefaultDocument.js'
```

Strapi's CLI registers every command at startup, and `commands/build` (and `commands/develop`) statically import `node/build` → `node/staticFiles` → `@strapi/admin/_internal` → `DefaultDocument`, which imports `react` and `react-dom`. So `start` loads the whole admin build chain even though it never builds anything 🤷.

[strapi/strapi#27910](https://github.com/strapi/strapi/pull/27910) makes both commands load their implementation lazily, inside the command's action. With it, `start` skips about 90 modules and boots without the admin slice or React. We apply it with [`pnpm patch`](/posts/2026-06-17-migrate-patch-package-to-pnpm-patch) until it's merged. Without the patch, keep `@strapi/admin`'s `dist/admin`, `react` and `react-dom`; everything else still works.

## What has to stay

- **`typescript`**, if you use `useTypescriptMigrations`: Strapi parses `tsconfig.json` with it at boot.
- **`@strapi/types`**: it only provides types, and its runtime entry is an empty file. But `@strapi/admin`, `content-manager` and `review-workflows` contain 60 bare `require('@strapi/types')` calls, left behind by `import '@strapi/types'` statements that bring the global `strapi` type into scope, so the package has to exist: without it, `strapi start` fails with `Cannot find module '@strapi/types'`. Only the `typedoc` packages it pulls in can go. I reported this as [strapi/strapi#27911](https://github.com/strapi/strapi/issues/27911), and my PR [strapi/strapi#26544](https://github.com/strapi/strapi/pull/26544) fixes it.
- **`date-fns`**: it looks like a frontend library, but `@strapi/utils`, `@strapi/database`, `@strapi/admin` (server), `@strapi/upload` and `@strapi/review-workflows` use it.
- **`sharp`**: `@strapi/upload` uses it for image formats.
- **`vite` 5 and two `esbuild` versions**: `@strapi/strapi` declares them as `dependencies` too, but an override would also remove them from local installs, where `strapi build` and `strapi develop` need them. Adding them to the step 3 list might work, since the image only runs `strapi start`, but we haven't tested that and kept them.

## Things that didn't work, or weren't worth it

- **Moving a package to `devDependencies` doesn't always remove it.** We moved `better-sqlite3` to dev, since production runs Postgres. It stayed: `knex` lists it as an optional peer, and pnpm satisfies that from the workspace even in `deploy --prod`. It has to be unlinked like the rest.
- **Off-the-shelf tools.** [SlimToolkit](https://github.com/slimtoolkit/slim) keeps only the files a probe run touches, and Strapi loads too much lazily (plugins, migrations, providers) for that to be safe. [`@vercel/nft`](https://github.com/vercel/nft) would need manual includes for Strapi's dynamic `require`s. `node-prune`, `clean-modules` and `modclean` only match file patterns (step 3.2) and have to be downloaded at build time.
- **A build-time check that no server file imports a listed package.** It flags `staticFiles.js`, so it can't replace a boot test.
- **Collapsing duplicate `@strapi/*` copies by hand.** pnpm creates several copies of `@strapi/admin` and others that differ only in peer resolution. In the root `pnpm install --prod` image they cost real space, which is why having fewer of them was part of step 0's drop from 3.2 GB to 2.93 GB. In the `pnpm deploy` output from step 1 on, the copies share their files through hardlinks and cost almost nothing on disk, so collapsing them further isn't worth it.

## Next: one workspace per plugin slice

Our own plugins have the same problem as Strapi's packages, on a smaller scale. Each is one package with an `admin/`, a `server/` and a `shared/` folder, so its admin-only libraries (`lucide-react`, `recharts`, `@apollo/client`, `react-hook-form`, a second `react-intl` and its `@formatjs` locale data) are `dependencies` of a package the server loads. Today step 3 removes them by name. We want to split each plugin into one workspace per slice instead:

- **`<plugin>-server`** stays the Strapi plugin: a `dependency` of the app, with `strapi.kind: "plugin"` and the `./strapi-server` export;
- **`<plugin>-admin`** holds the admin panel code and its UI libraries, and is only a `devDependency` of the app, because nothing needs it after `strapi build`;
- **`<plugin>-shared`** holds what both sides use (types, constants, validation), as a dependency of both.

`pnpm deploy --prod` then leaves the admin slice and its libraries out on its own, with no list to maintain, and the package boundary stops server code from importing an admin-only library by accident.

How it has to be wired, given what Strapi 5.56 does:

- Strapi discovers plugins only from the app's `dependencies`, so the admin package can't register itself.
- One plugin name can't come from two packages: if both declared the same `strapi.name`, the explicit `config/plugins.ts` entry would win and the server half wouldn't load.
- So the server package keeps a `./strapi-admin` export that re-exports the admin package. `strapi build` resolves that re-export inside the workspace, and `strapi start` only ever loads `./strapi-server`, so the admin package is never needed at runtime.

> 💡 If you know a supported way to publish a plugin's admin half as a build-time-only package, I'd rather use that than the re-export.

## Verifying it

Boot-test the image after every Strapi upgrade. A new version can start importing one of the listed packages on the server, and only a boot catches that. We run:

1. `docker build`, which also runs a real `strapi build`;
2. the image against a throwaway `postgres:17-alpine`, waiting for `/_health`;
3. a smoke test: `/admin` and its entry asset, register an admin and log in, a few admin routes (`users/me`, content-manager `init`, content-type-builder, upload, i18n, users-permissions roles), every plugin's routes, REST with and without a token, a GraphQL query, and no `Cannot find module` in the log;
4. a click through the admin panel in a browser.

## What about a plain npm app?

Everything above comes from a pnpm monorepo. To see what the same approach does for a plain npm project, I created a brand-new app with `npm create strapi-app@latest`: Strapi 5.56.0, TypeScript, npm, SQLite (the default) and the example blog content types. Same day, same arm64 machine, Docker 29, Node 24.21.0 and the same `node:24-bookworm-slim` runtime base.

| Fresh npm app                                                                                           | Uncompressed | Compressed |
| ------------------------------------------------------------------------------------------------------- | ------------ | ---------- |
| Before: `npm ci` → `strapi build` → `npm prune --omit=dev`, copy the app                                | 1.25 GB      | 217 MB     |
| After, Strapi as published (no patch)                                                                   | 749 MB       | 155 MB     |
| After, with the lazy-command patch ([strapi/strapi#27910](https://github.com/strapi/strapi/pull/27910)) | **731 MB**   | **152 MB** |

Inside the app (`/app`):

|                                                             | Before   | After, no patch | After, patched |
| ----------------------------------------------------------- | -------- | --------------- | -------------- |
| App layer (`COPY /app`)                                     | 765 MB   | —               | 311 MB         |
| `node_modules`                                              | 712 MB   | 293 MB          | 279 MB         |
| Package installs                                            | 1,384    | 924             | 921            |
| Source maps                                                 | 147.5 MB | 0               | 0              |
| `.d.ts`                                                     | 75.8 MB  | 0               | 0              |
| Markdown                                                    | 15.5 MB  | 0               | 0              |
| App's own files (`dist`, `public`, `data`, lockfile, `src`) | 17.6 MB  | 17.6 MB         | 17.6 MB        |

What that shows:

- **It works without pnpm or a monorepo.** On a fresh npm app it cuts the image by 42% uncompressed (1.25 GB → 731 MB) and 30% compressed (217 → 152 MB).
- **A fresh npm app starts much smaller** than our monorepo did (1.25 GB vs 3.2 GB), for two measured reasons: it has no other workspaces, and npm's flat `node_modules` has no pnpm peer-variant copies (1,384 installs, 1,191 distinct `name@version`).
- **The patch is worth only 18 MB here** (749 → 731 MB). Most of the saving is available with Strapi as published.

Gone after slimming: `webpack` and its loaders, `typedoc`, `styled-components`, `@strapi/design-system`, the Mux player and `hls.js`, `codemirror`, every `@types/*`, source maps, `.d.ts` files and markdown. The patched variant also drops `react`, `react-dom` and `@strapi/admin`'s `dist/admin`.

Still there in both "after" images: `vite` 5, `esbuild` 0.21 and 0.28, `@swc/core`, `lightningcss`, `prettier`, `@babel/core` and `typescript`, all build tooling `@strapi/strapi` declares as `dependencies` and kept because nobody has tested `strapi start` without them. Plus `sharp` (`@strapi/upload`), `better-sqlite3` (this app's database) and `@strapi/types` (see [strapi/strapi#27911](https://github.com/strapi/strapi/issues/27911)).

### What changes with npm

- **No override for webpack.** npm [`overrides`](https://docs.npmjs.com/cli/configuring-npm/package-json#overrides) can't delete a dependency the way pnpm's `"-"` does, so the webpack toolchain from step 2 goes on the script's list instead.
- **No store of symlinks to prune.** The script builds the dependency graph from `package.json` files, following Node's resolution rules (each package's `node_modules`, then its ancestors'), and deletes every installed package it can't reach.
- **Keep the SQLite driver if production runs SQLite.** Drop `better-sqlite3` only when production runs Postgres or MySQL.

The "before" image is the obvious build:

```dockerfile
ARG NODE_VERSION=24.21.0

FROM node:${NODE_VERSION}-bookworm AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# After the install, which would otherwise skip devDependencies (`typescript` is needed to
# build), and before `strapi build`, which otherwise bundles React's development build.
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --omit=dev

FROM node:${NODE_VERSION}-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 1337
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
```

The "after" image is the same, plus the patch and the script in the build stage:

```dockerfile
# in the build stage, after COPY . .
ARG LAZY_COMMANDS=1
RUN if [ "$LAZY_COMMANDS" = 1 ]; then \
		git apply --directory=node_modules/@strapi/strapi patches/strapi-lazy-commands.patch; \
	fi
# ... ENV NODE_ENV=production, npm run build, npm prune --omit=dev, then:
RUN LAZY_COMMANDS=$LAZY_COMMANDS node scripts/slim-node-modules.mjs .
```

`patches/strapi-lazy-commands.patch` is the `cli/commands/build` and `cli/commands/develop` hunks of [strapi/strapi#27910](https://github.com/strapi/strapi/pull/27910) against `@strapi/strapi` 5.56.0's `dist`. The script is [at the end of this post](#the-scripts).

All three images were checked the same way: boot on SQLite, `/_health`, `/admin` and its entry asset, register an admin and log in, then `admin/users/me`, `admin/information`, content-manager `init`, content-type-builder, upload, i18n locales, and users-permissions roles and email settings all return 200. REST `/api/articles` returns 403 without permission and 401 with an admin token, and there's no `Cannot find module` in the log.

> 📝 `review-workflows/workflows` and `content-releases` return 404 in all three images, "before" included. That's a fresh Community-edition project, not the slimming.

## What Strapi could change

All of the above works around how the packages are declared. These changes in Strapi itself would make most of it unnecessary for everyone:

- merge [strapi/strapi#27910](https://github.com/strapi/strapi/pull/27910), so `start` stops loading the admin build chain;
- make the webpack bundler an optional peer (or a separate package), now that vite is the default;
- publish the admin panel's frontend libraries as something production installs can skip, for example an admin package the app needs only at build time;
- stop loading `@strapi/types` at runtime ([strapi/strapi#27911](https://github.com/strapi/strapi/issues/27911), fixed by [strapi/strapi#26544](https://github.com/strapi/strapi/pull/26544)), and move `typedoc` and its plugins to its `devDependencies`;
- support plugins whose admin half is a separate, build-time-only package, so plugin authors can keep admin libraries out of production installs;
- publish without source maps and `dist/admin` in the server-facing packages, or ship them in separate packages.

## The scripts

The pnpm version is tested with Strapi 5.56, pnpm 12 and Node 24.

> 📝 What we run is this script plus our own plugins' entries in `FRONTEND_PACKAGES`; the version below only drops those entries.

<details>
<summary><code>scripts/slim-deploy.mjs</code></summary>

```js
// Deletes from a `pnpm deploy` output of a Strapi app what `strapi start` never loads.
// Usage: node scripts/slim-deploy.mjs <deploy dir>
//
// Run it in the stage that writes the deploy output: deleting in a later layer hides
// the files without shrinking the image.

import { readdir, realpath, rm } from "node:fs/promises";
import path from "node:path";

const BUILD_ONLY_FILE = /\.(map|md|markdown|[cm]?tsx?)$/;
const BUILD_ONLY_DIR = new Set(["__tests__"]);
// Only at a package's root: `dist/test` and the like can be a published subpath.
const BUILD_ONLY_ROOT_DIR = new Set([
	"doc",
	"docs",
	"example",
	"examples",
	"test",
	"tests",
]);

// Packages whose admin panel is prebuilt into the app's `dist/build`. Strapi loads each
// at runtime through its `./strapi-server` export, never `dist/admin`. `@strapi/admin`
// qualifies only through the patch from https://github.com/strapi/strapi/pull/27910 until it is merged:
// unpatched, the CLI imports its build command even for `start`, which requires
// `dist/admin/src/components/DefaultDocument.js`.
const ADMIN_SLICE_PACKAGE = /^@strapi\//;
/** @type {Record<string, string[]>} */
const UNBUILT_SOURCES = {
	"@strapi/plugin-users-permissions": ["admin", "documentation", "server"],
};

// The libraries the prebuilt admin panel was built from. Packages declare them as
// `dependencies`, but no server code imports them except `@strapi/strapi`'s
// `staticFiles.js` (`react`), which the patch from https://github.com/strapi/strapi/pull/27910 keeps off the `start`
// path until it is merged. A new Strapi or plugin version can start
// importing one server side, and only a boot of the image catches that, so boot-test
// after every bump. Not `date-fns`: Strapi's server uses it.
// Add your own plugins' admin-only libraries here.
const FRONTEND_PACKAGES = new Set([
	"@mux/mux-player-react",
	"@reduxjs/toolkit",
	"@strapi/design-system",
	"@strapi/icons",
	"@strapi/ui-primitives",
	"codemirror",
	"formik",
	"prismjs",
	"react",
	"react-dnd",
	"react-dnd-html5-backend",
	"react-dom",
	"react-helmet",
	"react-intl",
	"react-query",
	"react-redux",
	"react-router",
	"react-router-dom",
	"react-select",
	"react-window",
	"styled-components",
]);

// Production runs Postgres. `@strapi/database`'s `knex` lists the SQLite driver as an
// optional peer, which pnpm satisfies from the workspace even in a `--prod` deploy.
const DEVELOPMENT_DATABASE_DRIVERS = new Set(["better-sqlite3"]);

// `@strapi/types` declares its API-docs generator as `dependencies`. `@strapi/types` itself
// stays, because `@strapi/admin`'s server requires it; nothing but these three imports
// `typedoc`.
const DOCS_GENERATOR_PACKAGES = new Set([
	"typedoc",
	"typedoc-github-wiki-theme",
	"typedoc-plugin-markdown",
]);

const [deployDir] = process.argv.slice(2);

if (!deployDir) {
	console.error("Usage: node scripts/slim-deploy.mjs <deploy dir>");
	process.exit(1);
}

const nodeModules = path.join(deployDir, "node_modules");
const store = await realpath(path.join(nodeModules, ".pnpm"));

/** @typedef {{ name: string; location: string; isLink: boolean }} Package */

/**
 * The entries of one `node_modules` folder, scoped names included, skipping
 * pnpm's own `.bin`, `.pnpm` and `.modules.yaml`.
 *
 * @param {string} dir
 * @returns {Promise<Package[]>}
 */
async function listPackages(dir) {
	const packages = [];

	for (const entry of await readdir(dir, { withFileTypes: true })) {
		if (entry.name.startsWith(".")) {
			continue;
		}

		if (entry.name.startsWith("@") && entry.isDirectory()) {
			for (const scoped of await readdir(path.join(dir, entry.name), {
				withFileTypes: true,
			})) {
				packages.push({
					name: `${entry.name}/${scoped.name}`,
					location: path.join(dir, entry.name, scoped.name),
					isLink: scoped.isSymbolicLink(),
				});
			}

			continue;
		}

		packages.push({
			name: entry.name,
			location: path.join(dir, entry.name),
			isLink: entry.isSymbolicLink(),
		});
	}

	return packages;
}

/** The store's package folders, without its hoisting folder and lockfile. */
async function listStoreEntries() {
	const entries = await readdir(store, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
		.map((entry) => entry.name);
}

/**
 * Every package installed in the store, as the folder holding its files. The
 * other entries of `.pnpm/<entry>/node_modules` are symlinks to its dependencies.
 */
async function listInstalledPackages() {
	const installed = [];

	for (const entry of await listStoreEntries()) {
		const packages = await listPackages(
			path.join(store, entry, "node_modules"),
		);

		installed.push(...packages.filter((pkg) => !pkg.isLink));
	}

	return installed;
}

/** @param {Package[]} installed */
async function removeAdminSlices(installed) {
	for (const pkg of installed) {
		if (!ADMIN_SLICE_PACKAGE.test(pkg.name)) {
			continue;
		}

		const folders = ["dist/admin", ...(UNBUILT_SOURCES[pkg.name] ?? [])];

		await Promise.all(
			folders.map((folder) =>
				rm(path.join(pkg.location, folder), {
					recursive: true,
					force: true,
				}),
			),
		);
	}
}

/** @param {string} name */
function isBuildOnlyPackage(name) {
	return (
		name.startsWith("@types/") ||
		FRONTEND_PACKAGES.has(name) ||
		DEVELOPMENT_DATABASE_DRIVERS.has(name) ||
		DOCS_GENERATOR_PACKAGES.has(name)
	);
}

/** Removes every link to a build-only package, so pruneUnreachable deletes it. */
async function unlinkBuildOnlyPackages() {
	const folders = [nodeModules];

	for (const entry of await listStoreEntries()) {
		folders.push(path.join(store, entry, "node_modules"));
	}

	for (const folder of folders) {
		const links = (await listPackages(folder)).filter(
			(pkg) => pkg.isLink && isBuildOnlyPackage(pkg.name),
		);

		await Promise.all(links.map((link) => rm(link.location)));
	}
}

/** @param {NodeJS.ErrnoException} error */
function ignoreDanglingLink(error) {
	if (error.code === "ENOENT") {
		return undefined;
	}

	throw error;
}

/**
 * Deletes every store entry no longer reachable from the app's `node_modules` by
 * following dependency symlinks.
 *
 * `.pnpm/node_modules` is deliberately not a root: pnpm hoists every package there
 * for undeclared imports, so starting from it would keep everything. An entry
 * reached only through it is a dependency nobody declares.
 */
async function pruneUnreachable() {
	/** @type {Set<string>} */
	const reachable = new Set();
	const pending = [nodeModules];

	for (let dir = pending.pop(); dir !== undefined; dir = pending.pop()) {
		for (const pkg of await listPackages(dir)) {
			const target = await realpath(pkg.location).catch(
				ignoreDanglingLink,
			);

			if (target === undefined) {
				continue;
			}

			const [entry] = path.relative(store, target).split(path.sep);

			if (
				entry === undefined ||
				entry.startsWith("..") ||
				reachable.has(entry)
			) {
				continue;
			}

			reachable.add(entry);
			pending.push(path.join(store, entry, "node_modules"));
		}
	}

	const unreachable = (await listStoreEntries()).filter(
		(entry) => !reachable.has(entry),
	);

	await Promise.all(
		unreachable.map((entry) =>
			rm(path.join(store, entry), { recursive: true }),
		),
	);
}

/**
 * @param {string} dir
 * @param {boolean} isPackageRoot
 */
async function removeBuildOnlyFiles(dir, isPackageRoot) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const location = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (
				BUILD_ONLY_DIR.has(entry.name) ||
				(isPackageRoot && BUILD_ONLY_ROOT_DIR.has(entry.name))
			) {
				await rm(location, { recursive: true });
			} else {
				await removeBuildOnlyFiles(location, false);
			}

			continue;
		}

		if (entry.isFile() && BUILD_ONLY_FILE.test(entry.name)) {
			await rm(location);
		}
	}
}

const installed = await listInstalledPackages();

await removeAdminSlices(installed);

for (const pkg of installed) {
	await removeBuildOnlyFiles(pkg.location, true);
}

await unlinkBuildOnlyPackages();
await pruneUnreachable();
```

</details>

The npm version was run only on the fresh app above. Its lists are the pnpm script's lists plus the 11 webpack-toolchain names, and `react`/`react-dom` are only on the list when `LAZY_COMMANDS=1`.

<details>
<summary><code>scripts/slim-node-modules.mjs</code></summary>

```js
// Deletes from an npm production install of a Strapi app what `strapi start` never loads.
// Usage: LAZY_COMMANDS=0|1 node scripts/slim-node-modules.mjs <app dir>
//
// Run it in the stage that installs node_modules: deleting in a later layer hides the
// files without shrinking the image.

import { readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

// Set when patches/strapi-lazy-commands.patch (https://github.com/strapi/strapi/pull/27910)
// is applied. Unpatched, the CLI loads its build command even for `start`, which reaches
// `@strapi/admin/dist/admin/src/components/DefaultDocument.js` and `react`/`react-dom`.
const lazyCommands = process.env.LAZY_COMMANDS === "1";

const BUILD_ONLY_FILE = /\.(map|md|markdown|[cm]?tsx?)$/;
const BUILD_ONLY_DIR = new Set(["__tests__"]);
// Only at a package's root: `dist/test` and the like can be a published subpath.
const BUILD_ONLY_ROOT_DIR = new Set([
	"doc",
	"docs",
	"example",
	"examples",
	"test",
	"tests",
]);

/** @type {Record<string, string[]>} */
const UNBUILT_SOURCES = {
	"@strapi/plugin-users-permissions": ["admin", "documentation", "server"],
};

// `@strapi/strapi` declares its deprecated webpack bundler as `dependencies`. npm's
// `overrides` cannot remove a dependency, so the image drops it here instead.
const WEBPACK_TOOLCHAIN = [
	"@pmmmwh/react-refresh-webpack-plugin",
	"css-loader",
	"esbuild-loader",
	"fork-ts-checker-webpack-plugin",
	"html-webpack-plugin",
	"mini-css-extract-plugin",
	"style-loader",
	"webpack",
	"webpack-bundle-analyzer",
	"webpack-dev-middleware",
	"webpack-hot-middleware",
];

// The libraries the prebuilt admin panel was built from. No server code imports them,
// except `react`/`react-dom` from `@strapi/strapi`'s `staticFiles.js` when unpatched.
// Not `date-fns`: Strapi's server uses it.
const FRONTEND_PACKAGES = [
	"@mux/mux-player-react",
	"@reduxjs/toolkit",
	"@strapi/design-system",
	"@strapi/icons",
	"@strapi/ui-primitives",
	"codemirror",
	"formik",
	"prismjs",
	"react-dnd",
	"react-dnd-html5-backend",
	"react-helmet",
	"react-intl",
	"react-query",
	"react-redux",
	"react-router",
	"react-router-dom",
	"react-select",
	"react-window",
	"styled-components",
	...(lazyCommands ? ["react", "react-dom"] : []),
];

// `@strapi/types` declares its API-docs generator as `dependencies`; nothing but these
// three imports `typedoc`.
const DOCS_GENERATOR_PACKAGES = [
	"typedoc",
	"typedoc-github-wiki-theme",
	"typedoc-plugin-markdown",
];

const BUILD_ONLY_PACKAGES = new Set([
	...WEBPACK_TOOLCHAIN,
	...FRONTEND_PACKAGES,
	...DOCS_GENERATOR_PACKAGES,
]);

/** @param {string} name */
function isBuildOnlyPackage(name) {
	return name.startsWith("@types/") || BUILD_ONLY_PACKAGES.has(name);
}

const [appArgument] = process.argv.slice(2);

if (!appArgument) {
	console.error("Usage: node scripts/slim-node-modules.mjs <app dir>");
	process.exit(1);
}

const appDir = path.resolve(appArgument);

/** @param {string} file */
async function exists(file) {
	return stat(file).then(
		() => true,
		() => false,
	);
}

/** @param {string} dir */
async function readManifest(dir) {
	return JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
}

/**
 * Finds `name` the way Node resolves a bare specifier from `fromDir`: in the
 * `node_modules` of `fromDir` and of each of its ancestors.
 *
 * @param {string} fromDir
 * @param {string} name
 */
async function resolvePackage(fromDir, name) {
	for (let dir = fromDir; ; dir = path.dirname(dir)) {
		if (path.basename(dir) !== "node_modules") {
			const candidate = path.join(dir, "node_modules", name);

			if (await exists(path.join(candidate, "package.json"))) {
				return candidate;
			}
		}

		if (path.dirname(dir) === dir) {
			return undefined;
		}
	}
}

/** Every package dir npm installed, nested ones included. */
async function listInstalledPackages(
	nodeModules = path.join(appDir, "node_modules"),
) {
	/** @type {{ name: string; dir: string }[]} */
	const packages = [];
	const entries = await readdir(nodeModules, { withFileTypes: true }).catch(
		() => [],
	);

	for (const entry of entries) {
		if (entry.name.startsWith(".") || !entry.isDirectory()) {
			continue;
		}

		const names = entry.name.startsWith("@")
			? (await readdir(path.join(nodeModules, entry.name))).map(
					(scoped) => `${entry.name}/${scoped}`,
				)
			: [entry.name];

		for (const name of names) {
			const dir = path.join(nodeModules, name);

			if (!(await exists(path.join(dir, "package.json")))) {
				continue;
			}

			packages.push({ name, dir });
			packages.push(
				...(await listInstalledPackages(
					path.join(dir, "node_modules"),
				)),
			);
		}
	}

	return packages;
}

/**
 * The package dirs reachable from the app's production dependencies, following
 * `dependencies`, `optionalDependencies` and `peerDependencies` without entering a
 * build-only package.
 */
async function findReachable() {
	const reachable = new Set();
	const root = await readManifest(appDir);
	/** @type {[string, string][]} */
	const pending = Object.keys({
		...root.dependencies,
		...root.optionalDependencies,
	}).map((name) => [appDir, name]);

	for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
		const [fromDir, name] = next;

		if (isBuildOnlyPackage(name)) {
			continue;
		}

		const dir = await resolvePackage(fromDir, name);

		if (dir === undefined || reachable.has(dir)) {
			continue;
		}

		reachable.add(dir);
		const manifest = await readManifest(dir);

		for (const dependency of Object.keys({
			...manifest.dependencies,
			...manifest.optionalDependencies,
			...manifest.peerDependencies,
		})) {
			pending.push([dir, dependency]);
		}
	}

	return reachable;
}

/**
 * @param {string} dir
 * @param {boolean} isPackageRoot
 */
async function removeBuildOnlyFiles(dir, isPackageRoot) {
	for (const entry of await readdir(dir, { withFileTypes: true }).catch(
		() => [],
	)) {
		const location = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (entry.name === "node_modules") {
				continue;
			}

			if (
				BUILD_ONLY_DIR.has(entry.name) ||
				(isPackageRoot && BUILD_ONLY_ROOT_DIR.has(entry.name))
			) {
				await rm(location, { recursive: true, force: true });
			} else {
				await removeBuildOnlyFiles(location, false);
			}

			continue;
		}

		if (entry.isFile() && BUILD_ONLY_FILE.test(entry.name)) {
			await rm(location, { force: true });
		}
	}
}

const before = await listInstalledPackages();
const reachable = await findReachable();
const unreachable = before.filter((pkg) => !reachable.has(pkg.dir));

for (const pkg of unreachable) {
	await rm(pkg.dir, { recursive: true, force: true });
}

const kept = before.filter((pkg) => reachable.has(pkg.dir));

for (const pkg of kept) {
	if (
		pkg.name.startsWith("@strapi/") &&
		(lazyCommands || pkg.name !== "@strapi/admin")
	) {
		for (const folder of [
			"dist/admin",
			...(UNBUILT_SOURCES[pkg.name] ?? []),
		]) {
			await rm(path.join(pkg.dir, folder), {
				recursive: true,
				force: true,
			});
		}
	}

	await removeBuildOnlyFiles(pkg.dir, true);
}

console.log(
	`slim-node-modules: kept ${kept.length} of ${before.length} packages (lazy commands: ${lazyCommands})`,
);
```

</details>

Thanks for reading my blog posts! 🎉
