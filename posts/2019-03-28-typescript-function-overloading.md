---
title: 🔀 TypeScript function overloading
description: >-
    One implementation, several call signatures. How to write them for
    functions, methods, constructors and statics, and the three rules that
    decide which signature a call actually gets.
tags: typescript, arguments, function, overload, class
created_at: "2019-03-28T08:58:38.734Z"
edited_at: "2026-09-25T14:30:00.000Z"
published_at: "2019-03-28T08:58:38.709Z"
---

> **tl;dr** Stack the call signatures above the implementation. The implementation signature is not one of them, and callers never see it.

```ts
function myMethod(a: string): string;
function myMethod(a: number): number;
function myMethod(a: number, b: string): [number, string];
```

## Functions

The signatures go first, then one implementation wide enough to accept all of them:

```ts
function myMethod(a: string): string;
function myMethod(a: number): number;
function myMethod(a: number, b: string): [number, string];
function myMethod(
	a: string | number,
	b?: string,
): string | number | [number, string] {
	if (typeof a === "string" && b === undefined) {
		return a;
	}

	if (typeof a === "number" && b === undefined) {
		return a;
	}

	if (typeof a === "number" && typeof b === "string") {
		return [a, b];
	}

	throw new TypeError(`myMethod: unsupported arguments`);
}
```

```ts
myMethod("Andrew"); // string
myMethod(123); // number
myMethod(123, "Andrew"); // [number, string]
```

```text
Andrew
123
[ 123, 'Andrew' ]
```

Two details in that body are easy to miss. The `typeof` checks narrow `a` and `b` as you go, so the tuple branch needs no cast — `a` really is a `number` by then. And the final `throw` is not decoration: without it the function falls off the end, and TypeScript says so.

```text
error TS2366: Function lacks ending return statement and return type does not include 'undefined'.
```

> 📝 This post originally reached for [`ow`](https://github.com/sindresorhus/ow) to do the runtime checks. Plain `typeof` narrows just as well and costs no dependency — and `ow` is ESM-only now, which is [its own adventure from CommonJS](/posts/2026-09-03-import-esm-only-packages-from-commonjs-typescript).

## Methods

Identical shape inside a class:

```ts
class MyClass {
	myMethod(a: string): string;
	myMethod(a: number): number;
	myMethod(a: number, b: string): [number, string];
	myMethod(
		a: string | number,
		b?: string,
	): string | number | [number, string] {
		if (typeof a === "string" && b === undefined) {
			return a;
		}

		if (typeof a === "number" && b === undefined) {
			return a;
		}

		if (typeof a === "number" && typeof b === "string") {
			return [a, b];
		}

		throw new TypeError(`myMethod: unsupported arguments`);
	}
}
```

```ts
let instance = new MyClass();

instance.myMethod("Andrew"); // string
instance.myMethod(123, "Andrew"); // [number, string]
```

## Constructors

Constructors overload too, which is the tidiest way to accept a value in more than one unit without a factory function for each:

```ts
class Money {
	readonly cents: number;

	constructor(cents: number);
	constructor(dollars: number, unit: "dollars");
	constructor(value: number, unit?: "dollars") {
		this.cents = unit === "dollars" ? Math.round(value * 100) : value;
	}
}
```

```ts
new Money(1999);
new Money(19.99, "dollars");
```

## Static methods

Same again, with `static` on every line — the signatures included:

```ts
class Temperature {
	static from(celsius: number): Temperature;
	static from(value: number, scale: "f"): Temperature;
	static from(value: number, scale?: "f"): Temperature {
		return new Temperature(scale === "f" ? ((value - 32) * 5) / 9 : value);
	}

	private constructor(readonly celsius: number) {}
}
```

```ts
Temperature.from(20);
Temperature.from(68, "f");
```

## Interfaces

An interface has no implementation to attach, so you just list the signatures:

```ts
interface Formatter {
	format(value: number): string;
	format(value: number, digits: number): string;
}
```

Any class implementing `Formatter` then supplies the single wide implementation itself.

## What cannot be overloaded

Getters and setters:

```ts
class Bad {
	get value(): string;
	get value(): number {
		return 1;
	}
}
```

```text
error TS2300: Duplicate identifier 'value'.
error TS1005: '{' expected.
```

A property access has no argument list, so there is nothing for TypeScript to resolve against. If you need two shapes out of one name, it has to be a method.

## Three things that trip people up

### 1. Order decides the result

Resolution takes the **first** signature the arguments fit, not the best one. Put a wide signature above a narrow one and the narrow one is unreachable — no warning, it just never wins. Narrowest first.

### 2. The body is not checked against the list

TypeScript checks the implementation signature against the overload signatures loosely, and never verifies the body honours each one. An implementation can return `null` while a signature above it promises `string`, and that compiles. An overload list is a promise you keep by hand.

### 3. `ReturnType` reads the last one

```ts
type R = ReturnType<typeof myMethod>; // [number, string]
```

Not the union of all three, and not the first — the last. Which is the opposite end from where call resolution starts, so a type-level read of the function can disagree with an actual call to it.

Where this gets genuinely useful is overloading on a type the caller has to earn, so that doing the work up front buys a better return type: [overloading on a branded type](/posts/2026-09-25-overloading-on-a-branded-type).

Thanks for reading my blog posts! 🎉
