---
title: 🧬 JSX at lowest level
published: true
tags: react, jsx, javascript, html
cover_image: infralist-com-Sc1GJCninik-unsplash.jpg
---

> **this post is a precursor for upcoming JSX posts**

So we all heard that JSX is a specific JavaScript syntax that is used by React to render components. Well, I would say JSX is just HTML in JavaScript. Or **J**ava-**S**cript-**X**ml 😂 because HTML is a sibling of XML and children of [SGML](https://en.wikipedia.org/wiki/Standard_Generalized_Markup_Language). Or maybe is just **J**ava-**S**cript e-**X**-tended.

> When people ask me what is React? I tell them that React is just JavaScript functions that return HTML. And this is basically a template engine.

```jsx
function Component() {
	/* ^^^^^^^^^^^^^^^^ */
	/*   ^^^ JavaScript */

	return <div className="yay">lorem ipsum</div>;
	/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
	/*       ^^^ HTML                   */
}
```

> Draft: JSX Specification
> XML-LIKE SYNTAX EXTENSION TO ECMASCRIPT
> http://facebook.github.io/jsx/

Ok, but HTML syntax is allowed only in the DOM, browser JavaScript does not support it. So it means we need to compile that to something that is supported by the browser.

JSX is just some syntactic sugar that is compiled to valid JavaScript.

> What is JSX Pragma?
> https://www.gatsbyjs.com/blog/2019-08-02-what-is-jsx-pragma/ > https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#pragma

At the moment it compiles to something like this.

```js
function Component() {
	return React.createElement("div", { className: "yay" }, "lorem ipsum");
}
```

As you can see the `<div>` syntax sugar is compiled to `React.createElement`. That's why we need to have React imported at the top of the file. Otherwise we will get an runtime error that React cannot be found.

```js
import React from "react";
```

> Production [`createElement`](https://github.com/facebook/react/blob/6ecad79ccf2c683cb21ac40dee5678358c7b6208/packages/react/src/ReactElement.js#L361) implementation
> Development [`createElement`](https://github.com/facebook/react/blob/6ecad79ccf2c683cb21ac40dee5678358c7b6208/packages/react/src/ReactElementValidator.js#L413) implementation

But that was until [React v17.0](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html), [Babel v7.9](https://babeljs.io/blog/2020/03/16/7.9.0#a-new-jsx-transform-11154httpsgithubcombabelbabelpull11154) and [TypeScript v4.1](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#react-17-jsx-factories), because after that they decided to extract JSX creation in a separate factory detached from React, and it is imported automatically 🚀 🚀 🚀

> Production [`jsx`](https://github.com/facebook/react/blob/6ecad79ccf2c683cb21ac40dee5678358c7b6208/packages/react/src/jsx/ReactJSXElement.js#L210) implementation
> Development [`jsx`](https://github.com/facebook/react/blob/6ecad79ccf2c683cb21ac40dee5678358c7b6208/packages/react/src/jsx/ReactJSXElementValidator.js#L297) implementation

Are you still here? Let's go deeper 😀

![man hard working](https://media.giphy.com/media/1wrgDc6j07hAlM7Jml/giphy.gif)

So if everything is configured correctly, this example:

```jsx
function Component() {
	return <div className="yay">lorem ipsum</div>;
}
```

Will be compiled to something like this:

```js
import { jsx } from "react/jsx-runtime";
function Component() {
	return jsx("div", { className: "yay", children: "lorem ipsum" });
}
```

> In a future stable release (already), React will support a group of new functions for instantiating JSX elements as an alternative to the legacy general-purpose React.createElement function. This will allow optimizing them better in the future.

So we see that `<div>` syntax sugar is compiled to `jsx(...)` at build time, but what happens with this call at runtime? Well, let's console.log this call.

When React calls `Component`

```js
function Component() {
	return jsx("div", { className: "yay", children: "lorem ipsum" });
}
```

It will return:

```js
function Component() {
	return {
		$$typeof: Symbol("react.element"),
		props: { className: "yay", children: "lorem ipsum" },
		type: "div",
	};
}
```

Actually there is an open [RFC](https://github.com/reactjs/rfcs/pull/107) that it seems that in the end React team will decide to compile directly JSX down to this object that is returned.

And for example if we want to render our `Compnent` to the DOM. Having this call

```jsx
ReactDOM.render(<Component />, rootElement);
```

It will be compiled to this:

```js
ReactDOM.render(
	{ $$typeof: Symbol("react.element"), type: Component },
	rootElement,
);
```

In the end our components are just some functions that return some objects that represent what we want rendered. So when we create our components, what we return is not what is rendered. ReactDOM calls our function components with some props, see this object definition that is returned and decides what and how to render on the screen. And JSX? JSX is just some syntax that is familiar to us because we know HTML.

But now we know that till our component goes down to ReactDOM it passes through some steps and transformations.

Also JSX is no more a React only thing, it's already used in a lot of projects, like vue, stenciljs, dom-chef, and many others...

Have a feeling that noone is reading these articles 😀
Thanks reader if you are here! ♥️

---

Cover Photo by <a href="https://unsplash.com/@alexkixa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Alexandre Debiève</a> on <a href="https://unsplash.com/s/photos/transistor?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
