---
title: 🪆 Nesting and overriding new React Context API
published: true
description:
tags: react, context, override, reactrouter
---

While learning **react-router** v4 I read some of their source code. And as we know they are using current context for passing down router and route info overriding previous/parent route info

{% github https://github.com/ReactTraining/react-router %}

```js
getChildContext() {
  return {
    router: {
      ...this.context.router,
      route: {
        location: this.props.location || this.context.router.route.location,
        match: this.state.match
      }
    }
  };
}
```

React team announced new Context API that no longer will be deprecated in React v16.3.0, that is already released :)

https://github.com/facebook/react/releases/tag/v16.3.0

Now I was thinking how ReactTraining will make this overriding using new Context API.
From start I used **create-react-context** polyfill for new context. It works exactly, just change the import.

```js
import { render } from "react-dom";
import React, { createContext } from "react";
// import createContext from "create-react-context";
```

Next we need to create the context. Context has a **Consumer** and a **Provider**

```js
const { Provider, Consumer } = createContext();
```

Provider is used to pass to him some data in `value` prop

```jsx
function Providing() {
	return <Provider value={"React is Awesome!"}>nested content...</Provider>;
}
```

And Consumer is used to consume that `value` using render props

```jsx
function Consuming() {
	return (
		<>
			<Consumer>
				{(theValue) => {
					return theValue;
				}}
			</Consumer>

			{/* shorthand */}
			<Consumer>{(theValue) => theValue}</Consumer>
		</>
	);
}

// output
// React is Awesome!
```

We may use the **Consumer** how many times we want.

Now back to our overriding. Here is my app

```jsx
const App = () => (
	<Provider value={{ location: "/" }}>
		<NestedPath>
			<NestedPath location="haha/">
				<NestedPath>
					<NestedPath>
						<NestedPath>
							<NestedPath />
						</NestedPath>
					</NestedPath>
				</NestedPath>
			</NestedPath>
		</NestedPath>
	</Provider>
);

ReactDOM.render(<App />, document.getElementById("root"));
```

And here is the output

```
/
/location/
/location/haha/
/location/haha/location/
/location/haha/location/location/
/location/haha/location/location/location/
```

And this is my **NestedPath** component

```jsx
const NestedPath = ({ location = "location/", children }) => (
	<Consumer>
		{(router) => (
			<React.Fragment>
				<div>{router.location}</div>
				<Provider value={{ ...router, location: router.location + location }}>
					{children || null}
				</Provider>
			</React.Fragment>
		)}
	</Consumer>
);
```

Here as you see inside **Provider** we override previous one with a new value. And all child **Consumers** now will take the new value.

Here is a sandbox to play with

https://codesandbox.io/s/lrvv8w784q

Thanks for reading!!! This is a duplicate of my Medium Story!
dev.to is new medium for developers :)
