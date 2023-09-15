---
title: 🧶 Implicit CLSX in React
published: true
tags: react, jsx, vue, clsx
cover_image: ash-from-modern-afflatus-LiLPRqxWI9I-unsplash.jpg
---

Using [`clsx`](https://github.com/lukeed/clsx) or [`classnames`](https://github.com/JedWatson/classnames) in [React](https://reactjs.org/) lately has become a trend with utility-first CSS frameworks like [Tailwind CSS](https://tailwindcss.com/), where you have to write a lot of classes, and sometimes also with conditionals.

If you come from a framework like [Vue](https://vuejs.org/) you may saw that there you have this [Class Binding](https://vuejs.org/v2/guide/class-and-style.html) functionality out of the box.

In this blog post I will show you how you can patch React library, so you don't have import `clsx` everywhere where you need it, and to have this functionally out of the box also in React.

> ☢️ This is just for learning purposes. Use at your own risk

#### Create new React App

```shell
yarn create react-app implicit-clsx
cd implicit-clsx
```

#### Install `clsx`

```shell
yarn add clsx
```

#### Remove `react`

```shell
yarn remove react
```

#### Install `react` under `raw-react` name (More about [NPM Aliases](https://dev.to/iamandrewluca/put-your-react-on-a-diet-3c6d))

```shell
yarn add raw-react@npm:react
```

#### Create own React that will export from `raw-react`

**my-react/index.js**

```js
module.exports = require("raw-react");
```

**my-react/jsx-runtime.js** (About [JSX Runtime](https://dev.to/iamandrewluca/jsx-at-lowest-level-371b))

```js
module.exports = require("raw-react/jsx-runtime");
```

**my-react/jsx-dev-runtime.js** (About [JSX Runtime](https://dev.to/iamandrewluca/jsx-at-lowest-level-371b))

```js
module.exports = require("raw-react/jsx-dev-runtime");
```

#### Install `my-react` as `react` package (More about [NPM Aliases](https://dev.to/iamandrewluca/put-your-react-on-a-diet-3c6d))

```shell
yarn add react@file:my-react
```

#### Patch JSX Runtime

Now let's patch JSX Runtime to check for `className`. Here comes the hard work 😀

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lt3ger9jgzyvjxqfmlmm.png)

**my-react/jsx-dev-runtime.js**

```js
module.exports = require("raw-react/jsx-dev-runtime");

const clsx = require("clsx").default;
const jsxDEV = module.exports.jsxDEV;

module.exports.jsxDEV = function () {
	if (typeof arguments[0] === "string" && arguments[1].className) {
		arguments[1].className = clsx(arguments[1].className);
	}

	return jsxDEV.apply(undefined, arguments);
};
```

Now it's time to explain what gibberish I wrote here 🤣 I will explain some things only everything else I think it's clear

- [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) arguments is an Array-like object accessible inside functions that contains the values of the arguments passed to that function.
- [`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) The apply() method calls a function with a given this value, and arguments provided as an array (or an array-like object).

Signature of function `jsxDEV` is `type, props, key`. So `arguments[0]` is `type` and `arguments[1]` is `props`

And we check if type is a string, because in `react-dom` host elements can be only strings, we don't want to change for example `className` on some function or class components.

And second we check if we have `className` prop, we patch it with a `clsx` call.

Last line in the function we just forward everything to the native `jsxDEV`

> To have this work also on build, you will need to apply this patch also to `jsx` and `jsxs` in `my-react/jsx-runtime.js` see repo link at the end

#### Reinstall `my-react` as `react` package to update

```shell
yarn add react@file:my-react
```

#### Change `App.js` to see the changes

Replace line with a single `className` as string

```js
<div className="App">
```

To something that usually can be passed to `clsx`

```js
<div className={["App1", "App1", { "App2": true }]}>
```

#### Start the app and let's check in browser

```shell
yarn start
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rxgtl80yqbr4xdhwz1ss.png)

Working example https://github.com/iamandrewluca/implicit-clsx

I played around with TypeScript version, but couldn't make it work because of types mismatch, needs more investigation.

And we are done! Thanks for reading my blog posts!

![](https://media.giphy.com/media/d2Z4rTi11c9LRita/giphy.gif)

Cover Photo by <a href="https://unsplash.com/@modernafflatusphotography?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Ash from Modern Afflatus</a> on <a href="https://unsplash.com/s/photos/inception?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
