---
title: 🗜️ Optimal Tuple vs Record
published: true
tags: javascript, webpack, react, vue
cover_image: pietro-mattia-zXqizKxnbBU-unsplash.jpg
---

Let's say we have this `createStore` function:

> Ignore the implementation, we focus only on return value.

```js
function createStore() {
	const state = 0;
	const dispatch = () => {
		/* ... */
	};
	return /* ... */;
}
```

> What is a `Store` ? See [Flux In-Depth Overview](https://facebook.github.io/flux/docs/in-depth-overview/#stores)
> React uses [Redux](https://redux.js.org/), Vue uses [Vuex](https://vuex.vuejs.org/), Angular uses [NgRx](https://ngrx.io/)

And we have two ways to return `state` and `dispatch`:

**Record:**

> What is a Record? [Wikipedia](<https://en.wikipedia.org/wiki/Record_(computer_science)>)

```js
function createStore() {
	// ...
	return { state, dispatch };
}

const { state, dispatch } = createStore();
console.log(state);
dispatch();
```

**Tuple:**

> What is a Tuple? [Wikipedia](https://en.wikipedia.org/wiki/Tuple)

```js
function createStore() {
	// ...
	return [state, dispatch];
}

const [state, dispatch] = createStore();
console.log(state);
dispatch();
```

> We used [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) when called our `createStore`

Now let me show you something amazing ✨ ✨ ✨ We will build both examples using [`webpack`](https://webpack.js.org/)

![throwing sparkles](https://media.giphy.com/media/7gaLHn9ap6aNq/giphy.gif)

**Record:**

```js
(() => {
	const { state: t, dispatch: s } = { state: 0, dispatch: () => {} };
	console.log(t), s();
})();
```

**Tuple:**

```js
(() => {
	const [o, c] = [0, () => {}];
	console.log(o), c();
})();
```

![amazed chris pratt](https://media.giphy.com/media/rVVFWyTINqG7C/giphy.gif)

To the moon? 🚀 Compiled code that uses tuples is far smaller than one using record. And I suppose this scales when your code base is far bigger.

But why this happens 🤔 Well, we can assume that everything that is returned from anywhere is a public API to the consumer. And when using a Record return, `webpack` will consider all fields as a public API, and cannot [obfuscate](https://en.wikipedia.org/wiki/Obfuscation) them.

On the other hand when returning a Tuple, `webpack` does not see any actual fields names, they are just items into an array, and it will obfuscate all the code.

Record also has an advantage that you can reorder the names of the API, while with Tuple you need to use the exact same order as it was defined.

What about the consumer that uses this public API? 🧑‍💻

Actually here is one more advantage when returning Tuple. Let's say that consumer wants the API under different name. Instead of `state` and `dispatch` to be `value` and `execute`

**Record:**

```js
const { state: value, dispatch: execute } = createStore();
```

**Tuple:**

```js
const [value, execute] = createStore();
```

As you can see consumer code becomes too verbose with Record example, and when he will compile his code, `webpack` again wil not have the ability to obfuscate his code 💯

> Example: [StackBlitz](https://stackblitz.com/edit/github-vcghka?devtoolsheight=33&file=webpack.config.js)

**Some dangerous tips:**

Tuple can be destructured as Record, and you can change order:

```js
function createStore() {
	// ...
	return [state, dispatch];
}

const { 1: dispatch, 0: state } = createStore();
```

Or you can return and Tuple and Record, and consumer can use API how it wants:

```js
function createStore() {
	// ...
	const store = [state, dispatch];
	store.state = state;
	store.dispatch = dispatch;
	return store;
}

const [state, dispatch] = createStore();
const { 0: state, 1: dispatch } = createStore();
const { state, dispatch } = createStore();
```

### Conclusion

In the end I think that using tuples is a better approach.
I think React team when released hooks took this into consideration for hooks that return multiple values like `useState`.

Thanks for reaching the end of this blog post 🙏

---

Cover Photo by <a href="https://unsplash.com/@pietromattia?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Pietro Mattia</a> on <a href="https://unsplash.com/s/photos/sprint?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
