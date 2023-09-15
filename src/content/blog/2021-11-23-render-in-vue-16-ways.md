---
title: 🎄 Render in Vue, 16+ ways
published: true
tags: vue, typescript, javascript, html
cover_image: josh-eckstein-VAJEea9u6k8-unsplash.jpg
---

In this blog post I will show you 16 ways how to render something in [Vue](https://v3.vuejs.org/)

## 🚀 So let's start

> Talk is cheap. Show me the code.
> ― Linus Torvalds

Here is full example that you can play around
https://github.com/iamandrewluca/vue-render-everywhere

## 🧰 Prerequisites

I'm using [Vite](https://vitejs.dev/) with this configuration

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
	plugins: [vue(), vueJsx()],
	resolve: { alias: { vue: "vue/dist/vue.esm-bundler.js" } },
});
```

When refering to a DOM element, this is the HTML for every example

```html
<script type="text/html" id="template-in-script">
	<li>The quick brown fox...</li>
</script>
```

## 🎁 Methods to render in Vue

I'm showing these methods only for learning purposes. Use at your own risk.

### Method 1: `template` option as `string`

```ts
import { defineComponent } from "vue";

export default defineComponent({
	template: "<li>The quick brown fox...</li>",
});
```

### Method 2: `template` option as a selector

```ts
import { defineComponent } from "vue";

export default defineComponent({
	template: "#template-in-script",
});
```

### Method 3: `template` option as a `HTMLElement`

```ts
import { defineComponent } from "vue";

export default defineComponent({
	template: document.querySelector("#template-in-script"),
});
```

### Method 4: using `render` option and `h` factory

```ts
import { defineComponent, h } from "vue";

export default defineComponent({
	render() {
		return h("li", "The quick brown fox...");
	},
});
```

### Method 5: using `render` option and `compile` function

```ts
import { compile, defineComponent } from "vue";

export default defineComponent({
	render: compile("<li>The quick brown fox...</li>"),
});
```

### Method 6: using `render` option and `compile` function with selector

```ts
import { compile, defineComponent } from "vue";

export default defineComponent({
	render: compile("#template-in-script"),
});
```

### Method 7: using `render` option and `compile` function with `HTMLElement`

```ts
import { compile, defineComponent, h } from "vue";

const element = document.querySelector("#template-in-script");
export default defineComponent({
	render: compile(element),
});
```

### Method 8: using `setup` function and `h` factory

```ts
import { h, defineComponent } from "vue";

export default defineComponent({
	setup() {
		return () => h("li", "The quick brown fox...");
	},
});
```

### Method 9: using `setup` and `compile` function

```ts
import { defineComponent, compile } from "vue";

export default defineComponent({
	setup() {
		return compile("<li>The quick brown fox...</li>");
	},
});
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yh10qbtghd279fyulvi1.png)

Boring? 🤣 We are not done yet 🚗

### Method 10: using functional component and `h` factory

```ts
import { h } from "vue";

export default function () {
	return h("li", "The quick brown fox...");
}
```

### Method 11: ⛔️ using functional component and `compile` function

> JUST AN EXPERIMENT, DO NOT USE

```ts
import { compile } from "vue";

const compiled = compile("<li>The quick brown fox...</li>");
export default function () {
	return compiled({});
}
```

And here we have the method that is used by most Vue developers, Single File Component

### Method 12: using SFC `template` tag

```vue
<template>
	<li>The quick brown fox...</li>
</template>
```

### Method 13: using SFC without `template` tag

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	template: "<li>The quick brown fox...</li>",
});
</script>
```

Actually when you use SFC with a `template` tag, compiler will convert the `template` to `render` function.

So basically you can use SFC without a `template` tag and use one of the methods above (all of them work).

But we are not done yet. We have 3 more methods.

Let me introduce you **JSX** 🤣

![hello fellow kids](https://media.giphy.com/media/1Qdp4trljSkY8/giphy.gif)

### Method 14: using `render` option and JSX

```tsx
import { defineComponent } from "vue";

export default defineComponent({
	render() {
		return <li>The quick brown fox...</li>;
	},
});
```

### Method 15: using `setup` function and JSX

```tsx
import { defineComponent } from "vue";

export default defineComponent({
	setup() {
		return () => <li>The quick brown fox...</li>;
	},
});
```

### Method 16: using functional component and JSX

```tsx
export default function () {
	return <li>The quick brown fox...</li>;
}
```

Does last one look familiar? 👀 Hello to React friends!
Yes a functional component with JSX in Vue looks identical with React function component.

![boy and girl meme](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du32bmgq6y3749emq8le.png)

Here is full example that you can play around
https://github.com/iamandrewluca/vue-render-everywhere

That's all for today. Thanks for reading my blog posts!
Never stop learning. Bye! 👋

Cover Photo by <a href="https://unsplash.com/@dcemr_e?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Joshua Eckstein</a> on <a href="https://unsplash.com/s/photos/crayons?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
