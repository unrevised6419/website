---
title: 🦥 React.lazy without a default export
description: >-
  React v16.6.0 introduced React.lazy that allows to code split without any
  external...
tags: react, lazy, esm
created_at: "2019-05-24T10:08:13.758Z"
edited_at: "2022-05-21T21:05:14.325Z"
published_at: "2019-05-24T10:21:20.360Z"
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
