---
title: 🗄️ Create own React.Fragment
published: true
description: Implement own `React.Fragment`
tags: react, fragment, jsx
cover_image: dominik-scythe-qetITdfzJ-w-unsplash.jpg
---

Do you want to use [`React.Fragment`](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html) in your app?
Are you using a React version lower than `16.2` that does not support fragments?
For some reason you cannot update React to support it?

Well I can tell you that you can create your own `Fragment`!

```jsx
function Fragment(props) {
	return props.children;
}
```

Yeap is that simple.

```jsx
import React from "react";
import ReactDOM from "react-dom";

function Fragment(props) {
	return props.children;
}

function App() {
	return (
		<Fragment>
			<div>We</div>
			<div>have</div>
			<div>own</div>
			<div>Fragments</div>
			<div>!!!</div>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("root"));
```

Here is a [demo](https://codesandbox.io/s/react-own-fragments-6reve) if you want to play around.

Note that React `16.1` is used that does not support `Fragment`

Also if you take a look at `Preact` `Fragment` implementation, you will see exactly the function that we wrote above.

https://github.com/preactjs/preact/blob/da382e13d9377a53056e4cb0fd741f6e0aadf1c1/src/create-element.js#L92-L94

Cover Photo by <a href="https://unsplash.com/@drscythe?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Dominik Scythe</a> on <a href="https://unsplash.com/s/photos/fragment?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
