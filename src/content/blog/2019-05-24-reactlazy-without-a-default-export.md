---
title: 🦥 React.lazy without a default export
published: true
description:
tags: react, lazy, esm
cover_image: dominik-scythe-qetITdfzJ-w-unsplash.jpg
---

React v16.6.0 introduced `React.lazy` that allows to code split without any external libraries.

https://reactjs.org/blog/2018/10/23/react-v-16-6.html

> The React.lazy function lets you render a dynamic import as a regular component.
>
> Before:
>
> ```jsx
> import OtherComponent from "./OtherComponent";
>
> function MyComponent() {
> 	return (
> 		<div>
> 			<OtherComponent />
> 		</div>
> 	);
> }
> ```
>
> After:
>
> ```jsx
> const OtherComponent = React.lazy(() => import("./OtherComponent"));
>
> function MyComponent() {
> 	return (
> 		<div>
> 			<OtherComponent />
> 		</div>
> 	);
> }
> ```
>
> https://reactjs.org/docs/code-splitting.html#reactlazy

Althought bellow there is a message

> `React.lazy` takes a function that must call a dynamic `import()`. This must return a `Promise` which resolves to a module with a `default` export containing a React component.

Which means that your `OtherComponent` should be exported this way

```jsx
export default function OtherComponent() {
	return <div>OtherComponent</div>;
}
```

But what if you have it exported not as default?

```jsx
export function OtherComponent() {
	return <div>OtherComponent</div>;
}
```

In this case you have to change a bit the `import()` code when importing this component

```jsx
const OtherComponent = React.lazy(() =>
	import("./OtherComponent").then((module) => ({
		default: module.OtherComponent,
	})),
);
```

What are we doing here, is just chaining the `Promise` returned by `import()` and adding that default export.

Please keep in mind that component imported with `React.lazy` should be rendered inside a `React.Suspense`

https://reactjs.org/docs/code-splitting.html#suspense

Cover Photo by <a href="https://unsplash.com/@scottkelley?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Scott Kelley</a> on <a href="https://unsplash.com/s/photos/sloth?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
