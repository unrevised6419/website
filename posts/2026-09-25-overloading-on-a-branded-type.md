---
title: 🎯 Overloading on a branded type
description: >-
    An overload set can hand the branded argument a precise return type and the
    unbranded one a nullable type, so callers that already did the parse stop
    handling a failure that cannot happen to them.
tags: typescript, types, branded-types, overload
created_at: "2026-09-25T13:00:00.000Z"
published_at: "2026-09-25T14:00:00.000Z"
---

> **tl;dr** Two signatures, branded one first.

```ts
function formatDate(date: ValidDate): string;
function formatDate(date: Date): string | null;
```

[Branded types](/posts/2026-09-25-typescript-branded-types) give you a type nobody can forge, and [the use cases post](/posts/2026-09-25-branded-types-good-bad-use-cases) covers where that is worth doing. Point them at [function overloading](/posts/2019-03-28-typescript-function-overloading) and you get something neither does alone: one function that is honest with careless callers and generous with careful ones.

## Why the pair works

A brand is an intersection. `ValidDate` is `Date & { readonly [brand]: "ValidDate" }`, so every `ValidDate` is a `Date`, and no `Date` is a `ValidDate`. Overload resolution takes the first signature the argument fits, and that one-way assignability is exactly the asymmetry it needs:

```ts
formatDate(valid); // string
formatDate(loose); // string | null
```

One implementation underneath, doing the check once:

```ts
function formatDate(date: ValidDate): string;
function formatDate(date: Date): string | null;
function formatDate(date: Date): string | null {
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return date.toISOString().slice(0, 10);
}
```

The runtime check never goes away — somebody has to make it. What changes is who is told about it. Callers holding a `ValidDate` already paid at the boundary, so they get a `string` and nothing to unwrap.

## Order matters, silently

```ts
function formatDate(date: Date): string | null;
function formatDate(date: ValidDate): string;
```

```ts
let formatted: string = formatDate(valid);
```

```text
error TS2322: Type 'string | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
```

First match wins, and a `ValidDate` matches `Date` perfectly well, so the wide signature swallows every call before the narrow one is ever considered. The brand is still there, it has just stopped paying. Narrowest signature first, always.

> ⚠️ Nothing warns you about this. The overload set still compiles, every call still type-checks, and the only symptom is a `| null` you thought you had got rid of.

## What it buys at the call site

Without the pair, the nullable return climbs the stack. Every caller either handles it or passes it on:

```ts
function postSlug(post: Post): string | null {
	let formatted = formatDate(new Date(post.created_at));
	if (formatted === null) {
		return null;
	}

	return `${formatted}-${post.title}`;
}
```

That `| null` is now part of `postSlug` too, and its callers inherit it, and so on outward. With the pair, the branch happens once where the string came in:

```ts
function postSlug(post: Post, created: ValidDate): string {
	return `${formatDate(created)}-${post.title}`;
}
```

with the one branch that remains sitting at the edge, where the string arrived:

```ts
let created = parseDate(post.created_at);
if (!created) {
	throw new Error(`Unparsable created_at: ${post.created_at}`);
}

postSlug(post, created);
```

Same amount of checking, in one place instead of five, and the functions in the middle went back to returning what they actually return.

## Unions fall through to the wide signature

```ts
declare const either: Date | ValidDate;

let formatted: string = formatDate(either); // TS2322
```

A union argument does not get distributed across the overloads, so it matches the signature that accepts the whole union — the pessimistic one. Narrow before the call, not after.

## The catch: the body is not checked against the list

```ts
function formatDate(date: ValidDate): string;
function formatDate(date: Date): string | null;
function formatDate(date: Date): string | null {
	return null;
}

let formatted: string = formatDate(valid);
formatted.toUpperCase();
```

That compiles, clean, and throws at runtime. TypeScript checks the implementation signature against the overload signatures loosely, and never verifies that the body honours each one — an overload list is a promise you keep by hand.

> 💡 It is the same kind of trust as the `as` inside a mint function: you are telling the compiler something it cannot check. Which is the argument for keeping both in one small function that gets read carefully, rather than spread across a module.

## Why not a conditional return type

```ts
function formatDate<T extends Date>(
	date: T,
): T extends ValidDate ? string : string | null {
	if (Number.isNaN(date.getTime())) return null as never;
	return date.toISOString().slice(0, 10) as never;
}
```

This resolves identically at the call site, and it is not any safer — every `return` needs an `as never`, because the body cannot prove anything about an unresolved conditional. It also leaks: hovers and error messages show the conditional rather than `string`. For two cases, the overload pair reads better. Save the conditional for when the return type is genuinely computed from the argument.

Thanks for reading my blog posts! 🎉

---

The boundary argument here is Alexis King's [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), which is worth reading in full.
