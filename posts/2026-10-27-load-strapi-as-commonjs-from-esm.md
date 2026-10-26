---
title: 🪝 Make Strapi load as CommonJS from ESM code with a Node resolve hook
og_title: 🪝 Load Strapi as CommonJS from ESM with a resolve hook
description: >-
    Importing Strapi from an ES module loads its broken ESM builds. A tiny Node
    resolve hook makes every @strapi package resolve to CommonJS instead.
og_description: >-
    Importing Strapi from an ES module loads its broken ESM builds. A tiny Node
    resolve hook loads CommonJS instead.
tags: strapi, node, esm, javascript
created_at: "2026-10-27T09:00:00.000Z"
published_at: "2026-10-27T09:00:00.000Z"
---

We moved part of our Strapi 5 codebase to ES modules. Type-checking passed, unit tests passed, and then Strapi crashed at boot with an error about `lodash`, a library we never import ourselves. The fix for that one crash turned out to be the easy part: underneath it was a second problem that would have quietly turned our 401s and 403s into 500s 😬.

> **tl;dr** When an ES module imports `@strapi/*`, Node picks the packages' ESM builds, which don't load in Node, and which would give you a second Strapi instance even if they did. Preload a [`module.registerHooks`](https://nodejs.org/api/module.html#moduleregisterhooksoptions) resolve hook that swaps the `import` condition for `require` for every `@strapi/*` specifier, and pass it through `NODE_OPTIONS` so `strapi develop`'s child process gets it too.

```js
// preload/strapi-commonjs.cjs
"use strict";
const { registerHooks } = require("node:module");

const STRAPI_SCOPE = "@strapi/";

registerHooks({
	resolve(specifier, context, nextResolve) {
		const isStrapi = specifier.startsWith(STRAPI_SCOPE);
		const hasImport = context.conditions.includes("import");

		if (!isStrapi || !hasImport) {
			return nextResolve(specifier, context);
		}

		return nextResolve(specifier, {
			...context,
			// Not just dropping "import": @strapi/provider-email-nodemailer has no "default" to fall back to.
			conditions: [
				...context.conditions.filter(
					(condition) => condition !== "import",
				),
				"require",
			],
		});
	},
});
```

```json
{
	"scripts": {
		"develop": "NODE_OPTIONS=\"$NODE_OPTIONS --require ./preload/strapi-commonjs.cjs\" strapi develop",
		"start": "NODE_OPTIONS=\"$NODE_OPTIONS --require ./preload/strapi-commonjs.cjs\" strapi start"
	}
}
```

Here's what goes wrong, why the obvious fixes don't help, and how to wire the hook into every way Strapi runs.

> 📝 Everything here was seen on Strapi 5.57.0 and Node 24.21.

## The crash

Most `@strapi/*` packages have an `import` condition in their `exports` map that points at an ESM `.mjs` build. That includes the `.` entry of `@strapi/strapi` and `@strapi/core`, and most `*/strapi-server` entries. So as soon as an ES module does something as ordinary as

```ts
import { factories } from "@strapi/strapi";
```

Node resolves the `import` condition and loads the `.mjs` files. And those don't load in Node:

```text
SyntaxError: The requested module 'lodash' does not provide an export named 'get'
```

The first one to fail is `@strapi/core/dist/configuration/get-dirs.mjs`. The ESM builds use named imports from CommonJS `lodash`:

```js
import { get } from "lodash";
```

Bundlers accept that. Node doesn't, because it can't statically detect `get` as a named export of `lodash`'s CommonJS build.

## The bug hiding behind the crash

Say the ESM builds did load. You still wouldn't want them 🙅.

The Strapi CLI is CommonJS, so it loads Strapi's CommonJS build. Your ES module would load the ESM build, which is a different set of files, so you'd get a **second Strapi instance** next to the one the CLI runs. Each one has its own copy of Strapi's error classes, and `instanceof` checks between the two fail. An error your code throws from one copy isn't recognized by the other, so a 401 or 403 becomes a 500.

## Who's affected

Any ES module that imports a runtime value from `@strapi/*`:

- a `"type": "module"` Strapi app;
- a `"type": "module"` library loaded by a **CommonJS** app with `require()`. The app is CommonJS, but the library's own imports still resolve the `import` condition.

Type-only imports are fine, because they're erased before anything runs.

> ⚠️ Unit tests won't catch this. Vitest bundles your code and copes with the `lodash` named imports just fine. It only fails when Strapi boots in plain Node.

## Why peer dependencies don't fix it

The usual advice for duplicate instances is "make it a peer dependency". That guarantees a single **installed copy** of `@strapi/core`. But both builds live inside that one copy, and which file loads is decided by the importer's module format, not by how many copies are installed. One copy, two instances.

## Why not a pnpm patch

You can [`pnpm patch`](https://pnpm.io/cli/patch) `@strapi/strapi` and drop its `import` condition. It works, but only for that one package. Covering every `@strapi/*` package you load directly or indirectly means about 12 patches to carry and re-create on every Strapi upgrade.

A resolve hook covers all of them, including indirect ones, and isn't tied to a version.

## The resolve hook

[`module.registerHooks`](https://nodejs.org/api/module.html#moduleregisterhooksoptions) (Node 22.15+ and 24) registers synchronous, in-thread hooks that run for both `import` and `require`. The `resolve` hook gets every specifier along with the conditions Node is about to match against the `exports` map. For `@strapi/*` specifiers resolved with `import`, the hook from the tl;dr resolves them as if they had been `require`d. Everything else passes through untouched.

> 💡 Add `require`, don't just remove `import`. In 32 of the 34 `@strapi` entries with an `import` condition, `default` points at the same file as `require`. But `@strapi/provider-email-nodemailer` (`.` and `./utils`) has no `default`, so removing `import` alone throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.

The admin panel isn't affected: Vite doesn't use Node's resolver, so the admin bundles keep using the ESM builds, which is what you want there.

## Wiring it into every way Strapi runs

The hook only helps if it's registered before anything else loads, everywhere Strapi starts.

#### 1. package.json scripts

Use `NODE_OPTIONS` rather than a bare `--require`, as shown in the tl;dr. `strapi develop` forks a child process for the server, and only `NODE_OPTIONS` reaches it.

#### 2. Docker

Call the CLI's entry file through `node` directly:

```dockerfile
CMD ["node", "--require", "./preload/strapi-commonjs.cjs", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
```

If you build the image with `pnpm deploy`, add the preload to `files` in `package.json`, or it won't be in the deploy output:

```json
{
	"files": ["dist", "preload", "public"]
}
```

#### 3. Everything else

Smoke tests, CI scripts and any direct `strapi` CLI call need the preload too. Grep for `strapi ` and `strapi.js` and check each one.

## If your app itself is "type": "module"

With the hook in place, a `"type": "module"` Strapi app boots: in our case REST, GraphQL and the admin all served, and `strapi develop` reloaded on edits. A few things to know:

- Strapi loads `config/`, `src/index`, the APIs and the migrations with a synchronous `require()`. On Node 24, [`require(esm)`](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require) works and returns a namespace with `__esModule: true`, so Strapi's `importDefault` picks up `.default`.
- Because of that, avoid **top-level `await`** anywhere in the app's module graph: `require(esm)` rejects it with `ERR_REQUIRE_ASYNC_MODULE`.
- Replace `__dirname` with [`import.meta.dirname`](https://nodejs.org/api/esm.html#importmetadirname).
- Some packages ship a single `.d.ts` that TypeScript reads as CommonJS, for example `@strapi/email/strapi-server`. An ESM default import of those is typed as the whole module. Import the type and index it instead:

```ts
import type emailServer from "@strapi/email/strapi-server";

type EmailServer = (typeof emailServer)["default"];
```

## Know when to delete it

The hook is a workaround, so add a regression test that tells you when it's no longer needed. Spawn Node with the preload and check that an ESM import gets the same instance as `require`:

```bash
node --require ./preload/strapi-commonjs.cjs --input-type=module -e '
import { createRequire } from "node:module";
import * as core from "@strapi/core";
let require = createRequire(import.meta.url);
if (core.default !== require("@strapi/core")) process.exit(1);
'
```

Then assert that the same import **fails** without the preload. The day that second assertion starts failing, Strapi's ESM builds work in Node and you can delete the hook 🎉.

Thanks for reading my blog posts! 🎉
