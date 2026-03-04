---

## title: "How to Dispose Strapi Services Using Node.js `using`" description: "Using the ECMAScript `using` statement and Symbol.dispose to properly manage lifecycle and cleanup in Strapi services" date: 2025-12-25 tags: [strapi, nodejs, typescript, resource-management]

## The Problem: Strapi Services With Hidden Lifecycles

Strapi services are often treated as stateless helpers. In reality, many services wrap **stateful resources**:

- database connections
- file handles
- message queues
- external SDK clients
- temporary files

Strapi does **not** provide a built‑in disposal lifecycle for services. Once instantiated, cleanup is usually manual, implicit, or forgotten entirely.

This becomes a real problem when you:

- allocate resources per request
- run background jobs
- create ad‑hoc services outside HTTP controllers

Leaks happen silently.

## Node.js Finally Gives Us a Primitive: `using`

Node.js (v20+) implements the ECMAScript **Explicit Resource Management** proposal:

- `using` statement
- `Symbol.dispose`
- `Symbol.asyncDispose`

This gives us a **language‑level, deterministic cleanup mechanism**.

No frameworks. No magic. Just scope‑bound disposal.

## Minimal Example: Disposable Service

```ts
class DisposableService {
	constructor(private readonly name: string) {
		console.log(`init ${name}`);
	}

	doWork() {
		console.log(`work ${this.name}`);
	}

	[Symbol.dispose]() {
		console.log(`dispose ${this.name}`);
	}
}

using service = new DisposableService("example");
service.doWork();
// dispose is called automatically at scope exit
```

This is **deterministic**, not GC‑based.

## Applying This to Strapi Services

Strapi services are usually factories:

```ts
export default () => ({
	find() {
		/* ... */
	},
});
```

We need to make them:

- stateful
- disposable
- still compatible with Strapi DI

## Pattern: Factory That Returns a Disposable Object

```ts
export default () => {
	const client = createExternalClient();

	return {
		async find() {
			return client.query();
		},

		[Symbol.dispose]() {
			client.close();
		},
	};
};
```

Now the service **owns a resource** and knows how to clean it up.

## Consuming the Service With `using`

```ts
const serviceFactory = strapi.service("api::report.report");

using service = serviceFactory();

await service.find();
```

Once the scope exits:

- `Symbol.dispose` is invoked
- resources are released
- no leaks

## Async Resources: `Symbol.asyncDispose`

For async cleanup (DB pools, network clients):

```ts
export default () => {
	const pool = createPool();

	return {
		query(sql: string) {
			return pool.query(sql);
		},

		async [Symbol.asyncDispose]() {
			await pool.end();
		},
	};
};
```

And consume it like this:

```ts
await using service = strapi.service("api::db.db")();
await service.query("select 1");
```

## Important Constraints (Read This)

Be honest about the tradeoffs:

- `using` is **lexically scoped** — you cannot return the service
- works best for **short‑lived, explicit usage**
- **do not** mix with Strapi global singletons
- Node.js 20+ required

If your service is a global singleton, disposal is the wrong abstraction.

## Where This Actually Makes Sense

Good use cases:

- background jobs
- one‑off scripts (`node ./scripts/*.ts`)
- request‑scoped resource allocation
- migrations and data pipelines

Bad use cases:

- shared services in controllers
- long‑lived Strapi plugins
- anything relying on implicit caching

## Why This Is Better Than `try/finally`

Yes, you can do this:

```ts
const service = create();
try {
	await service.run();
} finally {
	await service.dispose();
}
```

But `using`:

- is declarative
- cannot be forgotten
- composes cleanly
- matches RAII semantics

This is a **real improvement**, not syntactic sugar.

## Final Take

Strapi does not manage service lifecycles for you.

If you allocate resources, **you own cleanup**.

Node.js `using` + `Symbol.dispose` gives you:

- explicit ownership
- deterministic cleanup
- zero framework coupling

If you're on Node 20+ and writing serious Strapi code, you should already be using this pattern.

If you are not — you're leaking. Probably already.
