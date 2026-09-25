---
title: ⚖️ When to use branded types, and when not to
description: >-
    Branding pays off for the Invalid Date hole, sanitization state, money, ids
    and validated values. It is noise inside a single module, on types that are
    already distinct, and on anything mutable.
tags: typescript, types, branded-types, zod, date
created_at: "2026-09-25T11:00:00.000Z"
published_at: "2026-09-25T12:00:00.000Z"
---

> **tl;dr** Brand a type when a wrong value of the same underlying primitive is a real bug that nothing else can catch, and when there is one obvious place to mint it.

If you need the helper, it is in the [previous post](/posts/2026-09-25-typescript-branded-types):

```ts
declare const brand: unique symbol;

type Brand<T, B> = T & { readonly [brand]: B };
```

## Contents

[Good](#good):

1. [`ValidDate`](#1-validdate) — the `Invalid Date` sentinel
2. [Sanitization state](#2-sanitization-state) — forgetting to sanitize becomes a type error
3. [Units](#3-units) — the `19.99` that bills as 19 cents
4. [Ids that share a primitive](#4-ids-that-share-a-primitive) — the silent argument swap
5. [Validated values](#5-validated-values) — check once, at the boundary
6. [Encoding and normalization](#6-encoding-and-normalization) — absolute against relative paths

[Bad](#bad):

- [Inside one small module](#inside-one-small-module)
- [When a class would do](#when-a-class-would-do)
- [When the types are already distinct](#when-the-types-are-already-distinct)
- [Casting across a JSON boundary](#casting-across-a-json-boundary) — unless Zod is doing the minting
- [Anything mutable — including `Date`](#anything-mutable--including-date)

## Good

Every case below is the same shape: a type nobody can construct, plus one exported function that does the `as`. All that varies is what that function does before the cast — it checks, it transforms, or it just asserts.

### 1. `ValidDate`

Start here, because `Date` is a type that lies to you:

```ts
let d = new Date("nope");
```

```text
d instanceof Date  // true
d.getTime()        // NaN
```

No throw, no `null`. The type says `Date`, and what you have is the `Invalid Date` sentinel. It then spreads quietly:

```ts
JSON.stringify({ at: new Date("nope") }); // '{"at":null}'
new Date("nope").toISOString(); // RangeError: Invalid time value
```

```ts
let bad = new Date("nope");
let good = new Date("2026-09-25");

bad < good; // false
bad > good; // false
bad >= good; // false
```

All three are `false`, the same way every `NaN` comparison is. Sort comparators return `0`, so the array comes back "sorted" and wrong. And note the two outcomes above: the invalid date either disappears into a payload as `null`, or throws a `RangeError` at some render site far away from wherever it was parsed. Neither one points at the cause.

So brand it:

```ts
type ValidDate = Brand<Date, "ValidDate">;

export function parseDate(raw: string): ValidDate | null {
	let d = new Date(raw);
	return Number.isNaN(d.getTime()) ? null : (d as ValidDate);
}
```

Every consumer then takes the brand, and stops defending itself:

```ts
export function formatDate(date: ValidDate): string {
	return date.toISOString().slice(0, 10);
}
```

The handling happens once, where the string comes in:

```ts
let created = parseDate(frontmatter.created_at);

if (!created) {
	throw new Error(`Unparsable created_at: ${frontmatter.created_at}`);
}

formatDate(created);
formatDate(new Date(frontmatter.created_at)); // TS2345
```

That `toISOString()` can no longer throw, and a `ValidDate[]` actually sorts, because `getTime()` is guaranteed not to hand back `NaN`:

```ts
posts.sort((a, b) => a.date.getTime() - b.date.getTime());
```

> 📝 Test with `Number.isNaN(d.getTime())`. `d.toString() === "Invalid Date"` happens to be specified, but it is a brittle thing to depend on.

What the brand does _not_ buy you is correctness:

```ts
new Date("2026-02-30").toDateString(); // 'Mon Mar 02 2026'
new Date(2026, 1, 30).toDateString(); // 'Mon Mar 02 2026'
```

February 30th rolls over into March, in both spellings, and the result is a perfectly valid `Date`. `ValidDate` proves "not `NaN`" and nothing more.

[`Temporal`](https://tc39.es/proposal-temporal/docs/) does not have the hole in the first place:

```ts
Temporal.PlainDate.from("2026-02-30");
```

```text
RangeError: Invalid day: 30; must be between 1-28
```

An impossible day is a parse failure, not a value that quietly means a different date. Handing it fields instead of a string is the one case that still bends, and even then it clamps rather than rolls over — `Temporal.PlainDate.from({ year: 2026, month: 2, day: 30 })` gives you `2026-02-28`, and `{ overflow: "reject" }` turns that into a `RangeError` as well.

### 2. Sanitization state

```ts
type RawHtml = Brand<string, "RawHtml">;
type SafeHtml = Brand<string, "SafeHtml">;

declare function render(html: SafeHtml): void;
```

Here the mint function is the sanitizer itself — the transform and the proof are the same step:

```ts
export function rawHtml(input: string): RawHtml {
	return input as RawHtml;
}

export function sanitize(dirty: RawHtml): SafeHtml {
	return DOMPurify.sanitize(dirty) as SafeHtml;
}
```

```ts
render(sanitize(rawHtml(comment.body)));
render(comment.body); // TS2345
```

Forgetting to sanitize is now a type error instead of an XSS. Note that `sanitize` takes `RawHtml` rather than `string`, which also rules out the other direction:

```ts
sanitize(sanitize(rawHtml(comment.body))); // TS2345
```

Double-escaping is a much smaller bug than an XSS, but it is the kind that reaches production and turns into `&amp;amp;` in somebody's name.

### 3. Units

```ts
type Cents = Brand<number, "Cents">;
type Dollars = Brand<number, "Dollars">;
type Milliseconds = Brand<number, "Milliseconds">;
```

Money and durations are where a plain `number` costs real money. Off-by-100 and off-by-1000 bugs don't look wrong in review.

The mint function has an invariant to enforce, and the conversion between two units becomes the only bridge between them:

```ts
export function cents(value: number): Cents {
	if (!Number.isInteger(value)) {
		throw new TypeError(`Cents must be a whole number, got ${value}`);
	}

	return value as Cents;
}

export function dollarsToCents(value: Dollars): Cents {
	return cents(Math.round(value * 100));
}
```

```ts
charge(dollarsToCents(price));
charge(price); // TS2345
```

That second line is the one worth having. `price` is a `number` holding `19.99`, and unbranded, `charge` would take it and bill 19 cents.

### 4. Ids that share a primitive

The canonical case, and the one from the last post. `UserId`, `PostId` and `OrgId` are all `string`, so every function taking two of them has a silent argument-swap bug waiting in it.

There is nothing to validate here, so the mint function only asserts:

```ts
type UserId = Brand<string, "UserId">;

export function userId(raw: string): UserId {
	return raw as UserId;
}
```

Call it once, where the id enters the program, and pass the result down:

```ts
let id = userId(Astro.params.id);

await loadUser(id);
await loadUser(Astro.params.id); // TS2345
```

### 5. Validated values

```ts
type Email = Brand<string, "Email">;

export function parseEmail(raw: string): Email | null {
	return raw.includes("@") ? (raw as Email) : null;
}
```

Validate once at the boundary. Downstream, `Email` means _already checked_, so nothing has to re-check defensively or wonder whether somebody did. [Zod](https://zod.dev/) ships this — `z.email().brand<"Email">()` gives you the brand and the runtime check together, which is the combination you actually want.

### 6. Encoding and normalization

`Base64`, `UrlEncoded`, a `Slug` guaranteed lowercase and hyphenated — and the one that bites most often, a path that may or may not be resolved yet:

```ts
type AbsolutePath = Brand<string, "AbsolutePath">;
type RelativePath = Brand<string, "RelativePath">;
```

These bugs are the same shape as unit bugs. The value looks entirely fine, it has just been through the transform one time too many, or one time short.

As with the sanitizer, the mint function is the transform:

```ts
import path from "node:path";

export function absolutePath(raw: string): AbsolutePath {
	return path.resolve(raw) as AbsolutePath;
}

export function relativeTo(from: AbsolutePath, to: AbsolutePath): RelativePath {
	return path.relative(from, to) as RelativePath;
}
```

```ts
let root = absolutePath(process.cwd());
let post = absolutePath("posts/2026-09-25-typescript-branded-types.md");

readPost(post);
readPost(path.join("posts", file)); // TS2345
```

`path.join` hands back a plain `string`, so anything you assemble by hand has to go through `absolutePath()` before a consumer will look at it. And since `resolve` normalizes on the way past — `..` collapsed, trailing slash gone — two `AbsolutePath` values for the same file are genuinely `===`, which two hand-built strings very often are not.

`relativeTo` is the other half. It insists both ends are absolute, so you cannot feed it something that was already relative and get a plausible-looking wrong answer back:

```ts
relativeTo(root, "posts/a.md"); // TS2345
```

## Bad

### Inside one small module

If the values never cross a boundary, nominal typing buys you nothing and the casts are pure noise. Brands earn their keep on public surfaces.

### When a class would do

A class gives you real methods, a real constructor you control, and `instanceof` at runtime. A phantom property gives you none of that. If you were reaching for behaviour anyway, write the class.

### When the types are already distinct

```ts
type Cat = { kind: "cat"; lives: number };
type Dog = { kind: "dog"; goodBoy: true };
```

A discriminated union already keeps these apart, at compile time _and_ at runtime. Branding structurally different types is solving a problem you don't have.

### Casting across a JSON boundary

```ts
let ids = JSON.parse(body) as UserId[];
```

This is a lie with extra steps. A brand is only as good as the function that mints it, and `as` is not a function — nothing here checked that the payload is an array, that its entries are strings, or that those strings are ids.

[Zod](https://zod.dev/) is the answer, because it mints the brand and runs the check in the same call:

```ts
import { z } from "zod";

const UserId = z.uuid().brand<"UserId">();
type UserId = z.infer<typeof UserId>;

const Payload = z.object({ ids: z.array(UserId) });
```

```ts
let { ids } = Payload.parse(JSON.parse(body));

ids.forEach(loadUser);
```

`ids` is a `UserId[]`, and this time the type is earned — `parse` would have thrown if the payload was not an object, if `ids` was not an array, or if any entry was not a UUID. A raw `string[]` still gets turned away:

```text
error TS2345: Argument of type '(id: string & $brand<"UserId">) => void' is not assignable to parameter of type '(value: string, index: number, array: string[]) => void'.
  Types of parameters 'id' and 'value' are incompatible.
    Type 'string' is not assignable to type 'string & $brand<"UserId">'.
```

> ⚠️ `.brand()` is type-level in Zod too, and adds nothing at runtime. The schema in front of it is the part that makes the brand true, so `z.string().brand<"UserId">()` is worth roughly what the `as` was.

Zod brands with its own symbol, so `z.infer<typeof UserId>` gives you `string & $brand<"UserId">` rather than your hand-rolled `Brand<string, "UserId">`. Pick one per project. Deriving the type from the schema is usually the one that stays honest, since there is then no way to have the type without the validator.

### Anything mutable — including `Date`

The `ValidDate` above has two holes, and both come from `Date` being a mutable class:

```ts
let d = parseDate("2026-09-25")!;
d.setTime(NaN); // still typed ValidDate, invariant gone
```

The brand claims a proof, and a mutable value can void that proof after minting, with the compiler smiling the whole time. On top of that, every `Date` method and constructor hands back a plain `Date`, so the brand falls off the moment you do anything:

```ts
let copy = new Date(d); // Date, not ValidDate
```

Every helper has to re-cast. Brands on immutable primitives never have this problem, which is why branding the serialized form usually beats branding the `Date`:

```ts
type IsoUtc = Brand<string, "IsoUtc">; // "2026-09-25T00:00:00.000Z"
type PlainDate = Brand<string, "PlainDate">; // "2026-09-25"
type EpochMillis = Brand<number, "EpochMillis">;
```

Immutable, serializable, survives a round trip through JSON, and the brand cannot be quietly invalidated. Convert to a `Date` at the point where you actually compute with it.

> 💡 `Temporal` deletes this whole category rather than patching it. `Temporal.Instant`, `Temporal.PlainDate` and `Temporal.ZonedDateTime` are separate immutable types that the compiler already refuses to mix, so there is no brand to void and none to drop. It is not in Node 24 yet (`typeof Temporal === "undefined"`), so reach for [`temporal-polyfill`](https://github.com/fullcalendar/temporal-polyfill) in the meantime.

## The rule

One brand, one mint site, on the boundary, on something immutable. Everything above is that sentence with examples attached.

Thanks for reading my blog posts! 🎉
