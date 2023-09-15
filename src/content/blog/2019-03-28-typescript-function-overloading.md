---
title: ♻️ TypeScript function overloading
published: true
description:
tags: typescript, arguments, function, overload
---

In this example I used [ow](https://github.com/sindresorhus/ow) for runtime arguments type checking, but you can check yourself `typeof a === 'string'`

![Type completion](https://thepracticaldev.s3.amazonaws.com/i/5jf2px2bfllmr6mflkip.png)

```ts
import ow from "ow";

function myMethod(a: string): string;
function myMethod(a: number): number;
function myMethod(a: number, b: string): [number, string];
function myMethod(
	a: string | number,
	b?: string,
): string | number | [number, string] {
	if (ow.isValid(a, ow.string) && ow.isValid(b, ow.undefined)) {
		console.log("function myMethod(a: string): string");
		return a;
	}

	if (ow.isValid(a, ow.number) && ow.isValid(b, ow.undefined)) {
		console.log("function myMethod(a: number): number");
		return a;
	}

	if (ow.isValid(a, ow.number) && ow.isValid(b, ow.string)) {
		console.log("function myMethod(a: number, b: string): [number, string]");
		return [a as number, b];
	}
}

console.log(myMethod(123));
// function myMethod(a: number): number
// 123

console.log(myMethod("Andrew"));
// function myMethod(a: string): string
// Andrew

console.log(myMethod(123, "Andrew"));
// function myMethod(a: number, b: string): [number, string]
// [123, "Andrew"]
```

Same is valid for classes

```ts
import ow from "ow";

class MyClass {
	myMethod(a: string): string;
	myMethod(a: number): number;
	myMethod(a: number, b: string): [number, string];
	myMethod(a: string | number, b?: string): string | number | [number, string] {
		if (ow.isValid(a, ow.string) && ow.isValid(b, ow.undefined)) {
			console.log("function myMethod(a: string): string");
			return a;
		}

		if (ow.isValid(a, ow.number) && ow.isValid(b, ow.undefined)) {
			console.log("function myMethod(a: number): number");
			return a;
		}

		if (ow.isValid(a, ow.number) && ow.isValid(b, ow.string)) {
			console.log("function myMethod(a: number, b: string): [number, string]");
			return [a as number, b];
		}
	}
}

const myClass = new MyClass();

console.log(myClass.myMethod(123));
// function myMethod(a: number): number
// 123

console.log(myClass.myMethod("Andrew"));
// function myMethod(a: string): string
// Andrew

console.log(myClass.myMethod(123, "Andrew"));
// function myMethod(a: number, b: string): [number, string]
// [123, "Andrew"]
```

https://codesandbox.io/embed/l7k6p45589
