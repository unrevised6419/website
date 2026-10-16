---
title: 🙃 verbatimModuleSyntax doesn't remove your imports, it keeps them
og_title: 🙃 verbatimModuleSyntax keeps imports, it doesn't drop them
description: >-
    TypeScript drops imports only used as types by default. verbatimModuleSyntax
    turns that off and keeps what you wrote, even imports of type-only packages.
og_description: >-
    TypeScript drops type-only imports by default. verbatimModuleSyntax stops
    that and keeps what you wrote, even empty imports.
tags: typescript, esbuild, swc, node
created_at: "2026-10-16T09:00:00.000Z"
published_at: "2026-10-16T09:00:00.000Z"
---

> **tl;dr** `verbatimModuleSyntax` doesn't remove imports, it stops TypeScript from removing them. Dropping imports that are only used as types was the default all along. If you want imports that are explicit and erased by every tool, write `import type { X }`, not `import { type X }`.

```ts
// ✅ Erased in every mode, by every tool
import type { Core } from "@strapi/types";

// ⚠️ With verbatimModuleSyntax this becomes `import {} from "@strapi/types"`,
// which still loads the package at runtime
import { type Core } from "@strapi/types";
```

For years I believed `verbatimModuleSyntax` was the option that removes unused and type-only imports from the output. It's the opposite 🙈. Here's how I found out, and what each option actually does.

## How I found out

I was working on Strapi's [`@strapi/types`](https://github.com/strapi/strapi/tree/develop/packages/core/types) package. It only ships types: its `dist/index.js` is an empty stub. The question was whether we could drop the `import`, `require` and `default` conditions from its `exports["."]` and keep only `types` and `source`, like its `./globals-admin` subpath already does (context in [strapi/strapi#26544](https://github.com/strapi/strapi/pull/26544)).

So I probed every import style across Node, tsx, tsc, esbuild, rollup, vite, webpack, jest and vitest. The result was consistent:

- Type-checking never broke.
- Anything that survived to runtime broke:
    - Node: `ERR_PACKAGE_PATH_NOT_EXPORTED`
    - esbuild: `Could not resolve`
    - webpack: `"." is not exported under the conditions [...]`

One survivor surprised me: `import { type Core } from '@strapi/types'` with `verbatimModuleSyntax` on. If the option removes type imports, why was there still an import left to fail? 🤔

## What tsc actually emits

Here's a file with five kinds of imports:

```ts
import { type Core } from "inline-type";
import { Core2 } from "used-as-type-only";
import { unused } from "unused-value";
import type { Core3 } from "import-type";
import "bare";

export const f = (s: Core.Strapi, t: Core2, u: Core3) => s;
```

With `verbatimModuleSyntax: false` (the default), tsc 5.9 emits:

```js
import "bare";
export const f = (s, t, u) => s;
```

With `verbatimModuleSyntax: true`, it emits:

```js
import {} from "inline-type";
import { Core2 } from "used-as-type-only";
import { unused } from "unused-value";
import "bare";
export const f = (s, t, u) => s;
```

The `Core2` line also fails type-checking:

```text
error TS1484: 'Core2' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

So the default is the mode that removes imports. Verbatim keeps everything except `import type`, and keeps an empty `import {}` where all specifiers were inline `type`.

And `import {} from 'x'` still loads `x` at runtime. Against a types-only package without runtime conditions, Node fails with:

```text
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined in .../@strapi/types/package.json
```

With the conditions in place, it loads the empty stub and carries on.

Transpilers do the same with `import { type Core } from 'x'`:

| Tool                                            | Default | `verbatimModuleSyntax` |
| ----------------------------------------------- | ------- | ---------------------- |
| tsc 5.9                                         | removed | `import {} from 'x'`   |
| esbuild 0.28 (reads `tsconfig.json`)            | removed | `import {} from "x"`   |
| swc 1.13 (`jsc.transform.verbatimModuleSyntax`) | removed | `import 'x'`           |

## Why the default removes imports

TypeScript's default is usage-based import elision: if none of the bindings an import brings in are used as a value, the whole statement is dropped. That happens without the `type` keyword, and it even drops value imports you never use, along with their side effects. Only a bare `import 'x'` is always kept.

## What verbatimModuleSyntax is for

[`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) arrived in TypeScript 5.0 and replaced `importsNotUsedAsValues` and `preserveValueImports`. The rule is in the name: what you write is what you get.

- `import type { X }` is dropped entirely.
- `import { type X }` drops the specifier but keeps the statement.
- Everything else is kept as written.

It exists for single-file transpilers: esbuild, swc, Babel, Bun, Deno and [Node's type stripping](https://nodejs.org/api/typescript.html#type-stripping). They see one file at a time, so in this snippet they can't tell whether `Foo` is a type:

```ts
import { Foo } from "./foo";
export { Foo };
```

With verbatim, the output follows from the syntax alone, so every tool agrees with tsc.

Node's type stripping never does usage-based elision. A type-only import without `type` stays in the output and fails at load time:

```text
SyntaxError: The requested module './foo.ts' does not provide an export named 'Foo'
```

## Why not always drop unused imports?

Because imports can have legitimate side effects:

- polyfills
- `reflect-metadata`
- modules that register plugins or decorators when imported
- Vue and Svelte templates that use imports TypeScript can't see (the reason `preserveValueImports` existed)

TypeScript can't know a package is pure, so verbatim keeps `import {} from 'x'` on purpose.

> 💡 Package-level purity is [`"sideEffects": false`](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) in `package.json`, but bundlers still resolve the specifier first, so it doesn't save an import that can't be resolved. Node ignores it.

## What I actually wanted

I wanted imports dropped when only types are used, without being forced to write `type` everywhere. That's the default, so leave `verbatimModuleSyntax` off and turn on [`isolatedModules`](https://www.typescriptlang.org/tsconfig/#isolatedModules):

```json
{
	"compilerOptions": {
		"isolatedModules": true
	}
}
```

`isolatedModules` doesn't force `type` on your imports. It flags only what single-file compilers would get wrong, like the re-export above:

```ts
import { T } from "./t";
export { T };
```

```text
error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
```

> 📝 [`erasableSyntaxOnly`](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly) (TS 5.8) has nothing to do with imports. It bans syntax that Node's type stripping can't erase: enums, value namespaces, parameter properties and `import x = require()`.

## If you want explicit imports anyway

Make them explicit with lint rules instead. Both autofix:

```js
rules: {
	"@typescript-eslint/consistent-type-imports": [
		"error",
		{ prefer: "type-imports", fixStyle: "separate-type-imports" },
	],
	"@typescript-eslint/no-import-type-side-effects": "error",
}
```

[`consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports/) adds `type` where an import is only used as a type, and [`no-import-type-side-effects`](https://typescript-eslint.io/rules/no-import-type-side-effects/) rewrites `import { type X }` to `import type { X }`. `import type { X }` is erased in every mode and by every tool.

> ⚠️ The exception is code that Node runs directly with type stripping. Node never does usage-based elision, so every type-only import needs an explicit `type`, and `verbatimModuleSyntax` or the lint rules above become mandatory.

Thanks for reading my blog posts! 🎉
