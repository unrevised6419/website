---
title: 🔐 Private Route in React Router v6
published: true
tags: react, router, security, authentication
cover_image: maxim-zhgulev-5tmItJfHkIc-unsplash.jpg
---

Things are changing fast in WEB today, and [`react-router`](https://reactrouter.com/) v6 is in beta already and around the corner. 🤔

> This is just for learning purposes only, react-router v6 is still in beta, use at your own risk

Private routes in v5 and below were done in a specific way using a custom component mostly named `PrivateRoute` that was most of the times just a wrapper and composition of basic `Route` and `Redirect` e.g.

```jsx
function PrivateRoute(props) {
	let { component: Component, children, render, ...rest } = props;
	let auth = useAuth();
	return (
		<Route
			{...rest}
			render={() => (auth ? <Component /> : <Redirect to="/login" />)}
		/>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Route path="/" component={Public} />
			<PrivateRoute path="/private" component={Private} />
		</BrowserRouter>
	);
}
```

But taking a look at v6 docs it seems that things changed a little bit, and we need to think a little bit different about it.

> For info about all API reference see the [link](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/docs/api-reference.md)

Let's move on.

Some things that we used to create `PrivateRoute` have changed a little bit

- `Redirect` is now [`Navigate`](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/docs/api-reference.md#navigate)
- [`Route`](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/docs/api-reference.md#routes-and-route) props changed and is just a stub component now
- A new component [`Routes`](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/docs/api-reference.md#routes-and-route) appearead

In v6, routes are rendered in such a manner

```jsx
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Public />} />
				<Route path="/private" element={<Private />} />
			</Routes>
		</BrowserRouter>
	);
}

const Public = () => <div>public</div>;
const Private = () => <div>private</div>;
```

So as you can see, no more render props or component prop.
You need to pass a direct JSX element (don't worry about performance if you do)

Ok now let's take a look at `Route` component [source code](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/packages/react-router/index.tsx#L198-L209)

```tsx
/**
 * Declares an element that should be rendered at a certain URL path.
 *
 * @see https://reactrouter.com/api/Route
 */
export function Route(_props: RouteProps): React.ReactElement | null {
	invariant(
		false,
		`A <Route> is only ever to be used as the child of <Routes> element, ` +
			`never rendered directly. Please wrap your <Route> in a <Routes>.`,
	);
}
```

![wait a minute](https://media.giphy.com/media/fnuSiwXMTV3zmYDf6k/giphy.gif)

Wait a minute where is the code? 👀 Well actually the parent component `Routes` will use the `Route` just as a host for the props and children, and do nothing more with the `Route`

> For more info about `Routes` implementation see [link](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/packages/react-router/index.tsx#L262-L274)

So how we do implement our `PrivateRoute` now? 🤔 If we do some adjustments to `PrivateRoute` props, it will look like this

```jsx
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Public />} />
				<PrivateRoute path="/private" element={<Private />} />
			</Routes>
		</BrowserRouter>
	);
}
```

But this will not work. `Routes` will just take the props of `PrivateRoute` and ignore it's body totally. Even a console.log inside `PrivateRoute` will not be shown.

So what we do? 🤔 We do some more adjustments to `PrivateRoute`

```jsx
function PrivateRoute({ children }) {
	const auth = useAuth();
	return auth ? <>{children}</> : <Navigate to="/login" />;
}
```

As you can see we changed `Redirect` to `Navigate`, and just return `children` if user is authenticated. And the usage of it also changes a little bit

```jsx
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Public />} />
				<Route
					path="/private"
					element={
						<PrivateRoute>
							<Private />
						</PrivateRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
```

As you can see `PrivateRoute` also moves to `element` prop.

> The implementation of `PrivateRoute` can be done in multiple ways.

Here is a different implementation of `PrivateRoute` using [`Outlet`](https://github.com/remix-run/react-router/blob/c13b66939ef48eacf7067f7aec4752777be8b17c/docs/api-reference.md#outlet)

```jsx
function PrivateOutlet() {
	const auth = useAuth();
	return auth ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/private-outlet" element={<PrivateOutlet />}>
					<Route element={<Private />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
```

The pros of this is that you can put multiple private sub routes under same route.

For a full example see this [Codesandbox](https://codesandbox.io/s/react-router-v6-security-gojb0)

That's all for today. Happy coding! 🎉 🎊 ✨

Keep your users secure!

![secure](https://media.giphy.com/media/IeKgCDlpTqRQbZEhBF/giphy.gif?cid=ecf05e4762b1bae6n9tm1kc51orxm9k9gvfanxp8ohfmk1xv&rid=giphy.gif&ct=g)

Cover Photo by <a href="https://unsplash.com/@jemjoyrussia?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Maxim Zhgulev</a> on <a href="https://unsplash.com/s/photos/lock?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
