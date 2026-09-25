---
title: 🏷️ Branded types in TypeScript
description: >-
    TypeScript compares types by shape, so a user id and a post id are both just
    a string and swapping them compiles. A brand makes them distinct at compile
    time and leaves nothing behind at runtime.
tags: typescript, types, branded-types, nominal-typing
created_at: "2026-09-25T09:00:00.000Z"
published_at: "2026-09-25T10:00:00.000Z"
---

> **tl;dr** Intersect the primitive with a phantom property, then hand out the branded value from exactly one function.

```ts
declare const brand: unique symbol;

type Brand<T, B> = T & { readonly [brand]: B };
```

## The bug it catches

```ts
declare function getPost(userId: string, postId: string): Promise<Post>;

getPost(postId, userId);
```

That compiles. TypeScript is [structurally typed](https://www.typescriptlang.org/docs/handbook/type-compatibility.html): it compares the shape of a type, never its name. Both parameters are `string`, both arguments are `string`, so the swap is invisible. The names `userId` and `postId` are documentation for you, not information for the compiler.

Brand them and the shapes stop matching:

```ts
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

declare function getPost(userId: UserId, postId: PostId): Promise<Post>;

getPost(postId, userId);
```

```text
error TS2345: Argument of type 'PostId' is not assignable to parameter of type 'UserId'.
  Type 'PostId' is not assignable to type '{ readonly [brand]: "UserId"; }'.
    Types of property '[brand]' are incompatible.
      Type '"PostId"' is not assignable to type '"UserId"'.
```

A bare `string` is rejected as well:

```text
error TS2345: Argument of type 'string' is not assignable to parameter of type 'UserId'.
  Type 'string' is not assignable to type '{ readonly [brand]: "UserId"; }'.
```

That second error is the one that does the real work. It means no id can wander in from a query param, a form field or a `JSON.parse` without passing through you first.

> 📝 The assignability goes one way. `UserId` is still a `string`, so `id.toUpperCase()` and `` `/users/${id}` `` keep working. You only lose the ability to go back the other way without saying so.

## Where the value comes from

The `[brand]` property does not exist. `declare const brand: unique symbol` declares a symbol that is never created, and nothing ever writes that key. So you cannot construct a `UserId` — you assert one:

```ts
export function userId(raw: string): UserId {
	return raw as UserId;
}
```

Put that cast in one place, export the function, and never cast anywhere else. `UserId` then means "came through `userId()`", and that is the entire promise a brand makes.

Mint it where the value enters the program, not where you happen to need it:

```ts
let id = userId(Astro.params.id);
```

> ⚠️ A brand with `as UserId` sprinkled across the codebase is decoration. The type is worth exactly as much as the discipline around the one function that produces it.

## Why `unique symbol`

A plain property works too, and you will see it everywhere:

```ts
type Brand<T, B> = T & { readonly __brand: B };
```

For branded primitives it holds up, because there is no way to write a `string` that also carries a `__brand`. Brand an object, though, and that key is just a key — anyone can type it:

```ts
type User = { name: string };
type Validated = Brand<User, "Validated">;

let user: Validated = { name: "Andrei", __brand: "Validated" };
```

That compiles. No cast, no error, no mint function. Whoever wrote it did not need to guess either, the exact shape to forge is right there in the type alias.

The second problem is collisions. Two modules that each roll their own helper and land on the same brand name produce two structurally identical types, and structural identity is the only thing TypeScript looks at:

```ts
type EmailA = Brand<string, "Email">; // yours, minted after a regex check
type EmailB = Brand<string, "Email">; // a dependency's, minted after an MX lookup

declare function send(email: EmailA): void;
declare const email: EmailB;

send(email);
```

Also compiles. Two different guarantees, silently interchangeable.

A `unique symbol` closes both:

```ts
declare const brand: unique symbol;

type Brand<T, B> = T & { readonly [brand]: B };
```

The forgery has nothing left to write, since the key is a symbol whose only binding lives in your module:

```text
error TS2353: Object literal may only specify known properties, and '__brand' does not exist in type 'Validated'.
```

And two helpers in two modules are now two distinct symbols, so the types stop being interchangeable even when the brand name matches:

```text
error TS2345: Argument of type 'EmailB' is not assignable to parameter of type 'EmailA'.
  Property '[brandApp]' is missing in type 'String & { readonly [brandDep]: "Email"; }' but required in type '{ readonly [brandApp]: "Email"; }'.
```

> 📝 Keep the symbol unexported. It is the whole mechanism — the moment it leaves the module, anyone can name the key and mint the type themselves.

One thing the symbol does not fix, because it was never a problem with the key: two different brands on the same value.

```ts
type Trimmed = Brand<string, "Trimmed">;
type NonEmpty = Brand<string, "NonEmpty">;

type Name = Trimmed & NonEmpty;

declare function saveName(value: Name): void;

saveName(trimmed("Andrei"));
```

```text
error TS2345: Argument of type 'Trimmed' is not assignable to parameter of type 'never'.
  The intersection 'Name' was reduced to 'never' because property '[brand]' has conflicting types in some constituents.
```

Both halves declare `[brand]`, one as `"Trimmed"` and the other as `"NonEmpty"`, so the property ends up as `"Trimmed" & "NonEmpty"` — `never` — and that takes the whole intersection down with it. `Name` is a type no value can ever have, and you only find out at the call site. The `__brand` spelling collapses in exactly the same way, because this is the shape of the brand value, not the key.

If you want brands that stack, make the phantom property a map:

```ts
declare const brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [brand]: { [K in B]: true } };
```

Intersecting now merges the two maps instead of colliding, and the narrower type stays assignable to each half:

```ts
saveName(parseName("Andrei"));
collapse(parseName("Andrei")); // a Name is still a Trimmed
saveName(trimmed("Andrei")); // TS2345, a Trimmed is not a Name
```

Only reach for it if you actually stack brands. The single-value version reads better in errors, and most codebases never intersect two of these.

> 💡 Every bit of this is erased. `Brand<string, "UserId">` is a `string` at runtime — no wrapper, no allocation, no check. You pay in casts, not in bytes.

Thanks for reading my blog posts! 🎉
