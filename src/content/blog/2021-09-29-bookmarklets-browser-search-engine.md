---
title: 🔍 Bookmarklets + Browser Search Engine
published: true
tags: javascript, bookmarklet, search, engine
cover_image: daniel-lerman-fr3YLb9UHSQ-unsplash.jpg
---

This post may be relevant mostly to developers or who loves automation. The Post covers two topics, and a combination of both in the end. But we will start with easy one first.

- Bookmarklets (medium)
- Browser Search Engine (easy)
- Bookmarklets + Browser Search Engine (hard)

## Browser Search Engine

![browser address bar](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dqld9utqzzdj1l1ua370.png)

Nowadays each browser allows you to type anything in the address bar. And it will open the website if what you typed is an URL, or just open your default search engine with your query.

What is cool that browsers allow you to change or add your own custom search engines 🎉

![add new browser search engine](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1mkvcbknarajw07bda7t.png)

As you can see in URL field you put anything you want and `%s` will be replaced with what you entered in address bar. This gives us powers.

Examples:

- `https://www.npmjs.com/package/%s` Go to NPM package
- `https://you-org.atlassian.net/browse/%s` Go to Jira task
- `https://www.typescriptlang.org/dt/search?search=%s` Search TypeScript Types
- `https://caniuse.com/#search=%s` Check a WEB feature

Actually most of the sites allow you to search on them, and you can take advantage of this, and reduce your time searching with custom search engines.

> **Tip:** You can make your website to register automatically as a custom search engine, see [OpenSearch description format](https://developer.mozilla.org/en-US/docs/Web/OpenSearch)

And we are done with first part of this post 😮‍💨

![weekend confused](https://media.giphy.com/media/Ta3v3I4GI1gH7Rqek6/giphy.gif)

## Bookmarklets

This is a more advanced topic because involves writing code 🧑‍💻 A bookmarklet is a simple browser bookmark (🔖), but in place of URL it is a specific code.

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1nfzmg5peyc7tstmqp1d.png)

Here is a very simple example. Create a bookmark and in place of URL put content below, then click on it. You will get that message. The trick is so that your code should start with `javascript:`

```js
javascript: alert("Hello World");
```

I have a [list of such bookmarklets](https://gist.github.com/iamandrewluca/61feacf07bc4f2f50e70f986c2e9b2d2) that do different stuff.

Here is a simple code template to get started (this is an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)):

```js
javascript: void (function () {
	/* Your code goes here */
})();
```

And we are done with our second part of the post 😮‍💨

![caught reading](https://media.giphy.com/media/9dFvgd4ID6ne0/giphy.gif?cid=ecf05e47efuljgieiqnet2019j93sgses0lswdjkxjz6d6yv&rid=giphy.gif&ct=g)

## Bookmarklets + Browser Search Engine

Are you still here? 🤔 Soooo. What would happen, and what we can do if we put such a bookmarklet script into the URL field of a custom search engine? To the moon 🚀 🚀 🚀

We can run a script but also we have access to what user introduced into address bar. Here is our template a little bit modified.

```js
javascript: void (function (s) {
	/* Your code goes here */
	/* `s` is what user typed in address bar */
})("%s");
```

We put `%s` browser placeholder for query as an argument when calling our IIFE.

Let's modify our script above to show us the message we typed in address bar.

```js
javascript: void (function (s) {
	alert(s);
})("%s");
```

![mindblow](https://media.giphy.com/media/m8WzRSb4xDcMx2WbkV/giphy.gif)

And a real exmple. Recently I made a static [Bookmarklet for Google Meet](https://gist.github.com/iamandrewluca/09b5cf4bddff0d3db30c90eeda6dac8b), when clicked, it will open my video using [Picture in Picture](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API) mode

Having this power of user input, we can register it as a custom search engine, and give user name in the input, and open a specific user video as Picture in Picture. So from bookmarklet I linked above we need to make a few changes.

From this:

```js
javascript: void (function () {
	// ...
	const userName = "You";
	// ...
})();
```

To this:

```js
javascript: void (function (userName = "You") {
	// ...
})("%s");
```

Now whenever I need to open some person video as PiP, I just activate this custom search engine using shortcut, and typing his name and hit Enter.

Easy Peasy Lemon Squeezy 🍋 🍋 🍋

![obama phew](https://media.giphy.com/media/6q29hxDKvJvPy/giphy.gif)

For me when I realised that this is possible it was an `Eureka!!!` moment.

Now I have to find different ways to simplify, automate and make faster my day to day web surfing experience!

Here is again my current list of [Bookmarklets](https://gist.github.com/iamandrewluca/61feacf07bc4f2f50e70f986c2e9b2d2).
If you have any crazy idea that could fill that list, I would be glad to implement it, if of course it will be possible 😃

Thanks for reaching the bottom 😀

Cover Photo by <a href="https://unsplash.com/@dlerman6?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Daniel Lerman</a> on <a href="https://unsplash.com/s/photos/search?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
