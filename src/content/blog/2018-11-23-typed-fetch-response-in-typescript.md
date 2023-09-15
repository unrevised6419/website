---
title: 💪🏼 Typed fetch Response in TypeScript
published: true
description:
tags:
---

Currently TypeScript `lib.dom.d.ts` does not implement Typed fetch response
https://github.com/Microsoft/TypeScript/blob/master/lib/lib.dom.d.ts#L2230
Bellow you can see how we can override that

```typescript
interface TypedResponse<T = any> extends Response {
	/**
	 * this will override `json` method from `Body` that is extended by `Response`
	 * interface Body {
	 *     json(): Promise<any>;
	 * }
	 */
	json<P = T>(): Promise<P>;
}

interface Payload {
	id: number;
}
```

Firsth method

```typescript
function myFetch<T>(...args: any): Promise<TypedResponse<T>> {
	return fetch.apply(window, args);
}

myFetch<Payload>("/")
	.then((response) => response.json())
	// here data will have Payload type
	.then((data) => console.log(data.id));
// or
myFetch("/")
	.then((response) => response.json<Payload>())
	// here data will have Payload type
	.then((data) => console.log(data.id));
```

Second method. I like first one

```typescript
declare function fetch<T>(...args: any): Promise<TypedResponse<T>>;

fetch<Payload>("/")
	.then((response) => response.json())
	// here data will have Payload type
	.then((data) => console.log(data.id));
// or
fetch("/")
	.then((response) => response.json<Payload>())
	// here data will have Payload type
	.then((data) => console.log(data.id));
```

Maybe some contrubution will help
https://github.com/Microsoft/TSJS-lib-generator/pull/622
