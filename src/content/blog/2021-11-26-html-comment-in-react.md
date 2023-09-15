---
title: ☢️ HTML Comment in React
published: true
tags: html, react, javascipt, typescript
cover_image: florian-olivo-4hbJ-eymZ1o-unsplash.jpg
---

If you ever started learning [React](https://reactjs.org/) and saw it's syntax JSX, you maybe thought. "This looks like HTML"

And one day you want to comment something in JSX, and your first try would be to do:

```tsx
function Component() {
  return (
    <div>
      <!-- This is my comment -->
      The quick brown fox ...
    </div>
  )
}
```

And for sure your bundler started complaining, that your syntax is invalid, and then you search the internet, and realise that a HTML Comment is not valid in JSX, and you learn that you have to use a JavaScript comment.

Well in this blog post I will show you for learning purposes how to trick React to render a real HTML Comment in your browser in a few steps.

### Step 1

Generate a React app using [Create React App](https://create-react-app.dev/)

```shell
npx create-react-app my-experiment --template typescript
cd my-experiment
npm run start
```

### Step 2

Open **App.tsx** and add a const with a unique id as a string

```tsx
const HTMLComment = "unique-html-comment";
```

### Step 3

Declare this `HTMLComment` as a [Intrinsic Element](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements) in your **App.tsx**. TypeScript is not required, but you have to learn something interesting 😊

```tsx
import { PropsWithChildren } from "react";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[HTMLComment]: PropsWithChildren<unknown>;
		}
	}
}
```

### Step 4

Render this created `HTMLComment` as a JSX element in your **App.tsx**

```tsx
function App() {
	return (
		<div className="App">
			<header className="App-header">
				<HTMLComment>This is my comment</HTMLComment>
				{/* ... */}
			</header>
		</div>
	);
}
```

Let's check what was rendered in browser.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/k83okt5fwr1z8no2aaei.png)

Well, that's expected, React thinks our element is a DOM element and renders it as usual. Let's move on.

### Step 5

- Open **node_modules/react-dom/cjs/react-dom.development.js**
- Find `createElement` function (line ~8954)
- Find `} else if (typeof props.is === 'string') {` (line ~8986)

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d9on1bxb4inltas3s4s2.png)

You see last `} else {`? inside that last branch a new element is created. We need to add one more `if` branch to check for our `HTMLComment`

```js
if (type === "unique-html-comment") {
	domElement = ownerDocument.createComment("");
}
```

Our final added code will look like this:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fdukpcjyyt7v0wjtlvst.png)

Save the file. Restart the CRA process so it can see new changes from inside `node_modules`

Open the browser to see the result.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/l1lkwoo6npdwzndjru3r.png)

And that's how you trick React into rendering a HTML Comment!
Feeeling like a hacker now? 🤣

![haker typing](https://media.giphy.com/media/YQitE4YNQNahy/giphy.gif)

Cover Photo by <a href="https://unsplash.com/@florianolv?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Florian Olivo</a> on <a href="https://unsplash.com/s/photos/html?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
