---
title: 🐏 How React memoization works
published: true
description: How to memoize your children to not trigger a re-render
tags: react, javascript, jsx
---

First you should know whats happening when using React and JSX

```jsx
import React from "react";

function SomeChildren() {
	/* ... */
	return null; /* ... */
}

function LinkWrapper(props) {
	/* ... */
	return null; /* ... */
}

function App() {
	return (
		<LinkWrapper uselink>
			<SomeChildren />
		</LinkWrapper>
	);
}
```

When compiling `JSX`, Function `App` becomes

```jsx
import React from "react";

function App() {
	return React.createElement(
		LinkWrapper, // component
		{ useLink: true }, // props
		React.createElement(SomeChildren), // children
	);
}
```

And at runtime when React calls your function, here is what your function will return
Replaced `App` return with what kind of data `React.createElement` is returning.

```jsx
function App() {
	return {
		$$typeof: Symbol(react.element),
		type: LinkWrapper,
		props: {
			useLink: true,
			children: {
				$$typeof: Symbol(react.element),
				type: SomeChildren,
				props: {},
			},
		},
	};
}
```

So at every call, React will always get a new definition of your `App`,
This will trigger to get the definition for all tree of components.
Note: This will not actually render to DOM anything. React just needs to know if anything changed.

Now for example you use `React.memo` to memoize your `LinkWrapper`

```jsx
const LinkWrapper = React.memo((props) => {
	return null; /* ... */
});
```

This will make React to receive previous `LinkWrapper` return value if props were not changed.
Note: By default it will only shallowly compare complex objects in the props object.

Now let's come back at our `App`

```jsx
function App() {
	return (
		<LinkWrapper uselink>
			<SomeChildren />
		</LinkWrapper>
	);
}
```

As I explained above `<SomeChildren />` always will return a new React definition.
This means that using `React.memo` on `LinkWrapper` will not have any effect.
Because children always will be a new definition.

If you want to also memoize children you will have to do it manually.

```jsx
function App() {
	const memoChildren = React.useMemo(() => <SomeChildren />, []);
	return <LinkWrapper uselink>{memoChildren}</LinkWrapper>;
}
```

This can also be wrote as

```jsx
function App() {
	const memoChildren = React.useMemo(() => <SomeChildren />, []);
	return <LinkWrapper uselink children={memoChildren} />;
}
```

Now `memoChildren` will always have same value between re-renders
Now `LinkWrapper` will also see that children did not change,
and will return last memoized value without calling the function again
