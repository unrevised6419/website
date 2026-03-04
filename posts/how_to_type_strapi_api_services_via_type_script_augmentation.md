---

## title: "How to Type Strapi API Services via TypeScript Augmentation" description: "A practical guide to strongly typing Strapi API services using TypeScript module augmentation instead of unsafe casting." date: 2025-01-25 tags: [strapi, typescript, api, backend] draft: true

## The Problem

Strapi exposes its APIs dynamically. From a runtime perspective this is fine, but from a TypeScript perspective it is weakly typed:

- `strapi.service('api::post.post')` returns `any`
- You lose autocomplete, refactoring safety, and compile-time guarantees
- Teams often fall back to `as any` or duplicated interfaces

This is avoidable.

TypeScript **module augmentation** lets you extend Strapi’s internal typings and make services fully type-safe without touching Strapi source code.

---

## Why Augmentation (and Not Casting)

Casting (`as MyService`) only silences TypeScript.\
Augmentation **changes the type system globally**.

Benefits:

- Real autocomplete
- Errors at compile time
- One source of truth
- No runtime cost

If you’re serious about Strapi + TS, augmentation is the only correct solution.

---

## How Strapi Types Services Internally

Strapi exposes service types through:

```ts
@strapi/strapi
```

Specifically:

- `Strapi['service']`
- Service UID strings (`api::post.post`)
- Generated content-type schemas

We will extend these types.

---

## Step 1: Define Your Service Interface

Create a service interface that matches your implementation.

```ts
// src/api/post/services/post.ts
export interface PostService {
	findPublished(): Promise<Post[]>;
	findBySlug(slug: string): Promise<Post | null>;
}
```

Your actual service implementation should already match this shape.

---

## Step 2: Create a Global Augmentation File

Create a `.d.ts` file that TypeScript always loads.

Recommended location:

```
src/types/strapi.d.ts
```

Make sure it is included in `tsconfig.json`.

---

## Step 3: Augment Strapi’s Module

```ts
// src/types/strapi.d.ts
import type { PostService } from "../api/post/services/post";

declare module "@strapi/strapi" {
	interface Strapi {
		service(uid: "api::post.post"): PostService;
	}
}
```

This tells TypeScript:

> “When someone calls `strapi.service('api::post.post')`, return `PostService`.”

No casting. No hacks.

---

## Step 4: Use It Anywhere

```ts
const postService = strapi.service("api::post.post");

const posts = await postService.findPublished();
```

You now get:

- Method autocomplete
- Parameter validation
- Return-type inference
- Compiler errors if the service changes

---

## Scaling to Multiple Services

You can extend the overload pattern:

```ts
declare module "@strapi/strapi" {
	interface Strapi {
		service(uid: "api::post.post"): PostService;
		service(uid: "api::category.category"): CategoryService;
	}
}
```

Or extract a UID → Service map:

```ts
interface ServiceMap {
	"api::post.post": PostService;
	"api::category.category": CategoryService;
}

declare module "@strapi/strapi" {
	interface Strapi {
		service<K extends keyof ServiceMap>(uid: K): ServiceMap[K];
	}
}
```

This scales cleanly for large projects.

---

## Common Mistakes

- ❌ Using `as unknown as`
- ❌ Declaring augmentation inside normal `.ts` files
- ❌ Forgetting to include `.d.ts` in `tsconfig`
- ❌ Letting service interfaces drift from implementation

If TypeScript doesn’t pick it up, it’s almost always a `tsconfig` include issue.

---

## When This Breaks

Augmentation will fail if:

- UID strings don’t match exactly
- The file isn’t loaded by the compiler
- You mix CommonJS and ESM incorrectly

None of these are Strapi problems. They are TS hygiene issues.

---

## Final Take

If you are:

- Using Strapi seriously
- Writing custom services
- Running TypeScript in strict mode

Then **not** augmenting Strapi types is technical debt.

Casting hides bugs.\
Augmentation prevents them.

---

## Next Steps

- Apply the same pattern to:
  - Controllers
  - Policies
  - Content-type schemas
- Enforce service typing in code review
- Remove all `any` around `strapi.service()`

If your editor doesn’t autocomplete Strapi services, your setup is incomplete.
