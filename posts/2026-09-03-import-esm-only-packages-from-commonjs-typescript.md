---
title: 🧩 Import ESM-only types from a CommonJS TypeScript project
og_title: "🧩 Import ESM-only types from a CommonJS TypeScript project"
description: >-
    A CommonJS file resolves an ESM-only package through the require condition,
    so its types go missing. The resolution-mode attribute fixes it.
og_description: "A CommonJS file loses the types of an ESM-only package. The resolution-mode import attribute fixes it for a single import."
tags: typescript, esm, commonjs, vite, node
created_at: "2026-09-03T09:00:00.000Z"
published_at: "2026-09-03T10:00:00.000Z"
---

> **tl;dr** Add an import attribute to the type-only import.

```ts
import type { Plugin } from "vite" with { "resolution-mode": "import" };
```

You ship a CommonJS tool, a [rollup](https://rollupjs.org/) plugin or a CLI, and you want [Vite](https://vite.dev/)'s types. With `"module": "node18"` and Vite `8.2.2`, the obvious import fails:

```ts
import type { Plugin } from "vite";
```

```text
error TS1541: Type-only import of an ECMAScript module from a CommonJS module must have a 'resolution-mode' attribute.
```

On Vite `5.4.21` the very same line fails differently, and much more confusingly:

```text
error TS2305: Module '"vite"' has no exported member 'Plugin'.
```

## Why

Under `module: node16` and up, TypeScript emulates Node's [`exports` conditions](https://nodejs.org/api/packages.html#conditional-exports). The condition it picks depends on the format of the **importing** file, so a CommonJS file resolves through `require`. Vite 5 pointed that condition at a stub, which is the whole file:

```ts
declare const module: any;

export = module;
```

It resolves, it just has no named exports. Hence TS2305. Vite 7 removed the stub entirely, so newer versions report the format mismatch directly instead.

> ⚠️ `import type` does not get you out of this. Type-only imports still resolve using the importing file's format.

## The fix

```ts
import type { Plugin } from "vite" with { "resolution-mode": "import" };
```

You're telling the resolver to pretend, for this one specifier, that the importing file is an ES module. The `import` condition wins, the real `.d.ts` loads, and `Plugin` is the actual type.

There is also a type-query spelling when you can't add a top-level import:

```ts
type ServerOptions = import("vite", {
	with: { "resolution-mode": "import" },
}).ServerOptions;
```

Things worth knowing:

- It needs TypeScript 5.3+. Older posts show `assert { "resolution-mode": "import" }`, a nightly-only spelling from before 5.3, and that now errors with `TS2880`.
- It only does something under `node16`, `node18`, `node20` or `nodenext`. Under `module: commonjs` it is accepted and ignored.
- It is type-only and fully erased, so nothing reaches your JavaScript.
- It survives into your `.d.ts` output verbatim, so your consumers need TypeScript 5.3+ too.

> 💡 For values, no attribute is needed. A dynamic `import("vite")` is always resolved with the `import` condition, so it's correctly typed on its own. Just keep `module` on `node16` or higher, since `module: commonjs` rewrites `import()` into a `require`.

Thanks for reading my blog posts! 🎉
