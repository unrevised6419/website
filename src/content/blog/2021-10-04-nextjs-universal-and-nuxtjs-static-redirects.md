---
title: 🔗 Next.js, Universal and Nuxt.js static redirects
published: true
tags: angular, react, vue, javascript
cover_image: javier-quiroga-kMdEgc_UNvg-unsplash.jpg
---

Frameworks like [`Next.js (React 💙)`](https://nextjs.org/), [`Nuxt.js (Vue 💚)`](https://nuxtjs.org/) and [`Universal (Angular ❤️)`](https://angular.io/guide/universal) allow you to register redirects.

---

- **Next.js** allows you to register redirects using [`redirects`](https://nextjs.org/docs/api-reference/next.config.js/redirects) function inside `next.config.js`
- **Nuxt.js** allows you to register redirects using [`redirect-module`](https://github.com/nuxt-community/redirect-module) in `nuxt.config.js`
- **Universal** allows you to register redirects at server engine router level. e.g. [`@nguniversal/express-engine`](https://github.com/angular/universal/blob/master/modules/express-engine/README.md)

But in all the cases when your app is served, it should stay on top of a [`nodejs`](https://nodejs.org/en/) server to handle all the requests.

> But I want my application to be a static served application that lives only on client, without a server 😢

Well, this is the single limitation of all the frameworks redirects, but don't be sad, we have a solution, that comes with it's own limitations 😄

![girl hehe](https://media.giphy.com/media/B0vFTrb0ZGDf2/giphy.gif)

## Say Hello to HTML Redirections 🚀

From what [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#html_redirections) says, HTML Redirections are a way to make redirects using a `meta` tag in your HTML head when you don't have control over the server.

**Example:**

```html
<meta http-equiv="Refresh" content="0; URL=https://example.com/" />
```

This is all we need to know. The `0` in the beginning of the `content` attribute is the delay in seconds when redirect should happen.

**Limitations**

- RegExp is not supported, like in server redirects
- Status code cannot be changed
- A small payload delay for fetched HTML

Taking this idea, we can apply it to our frameworks, and create static HTML redirects. Taking into consideration that all frameworks have a folder where you can put your public static assets, we can create html files with our `meta` tag for redirects.

- `Next.js` with `React` uses `public` folder
- `Nuxt.js` with `Vue` uses `static` folder
- `Universal` with `Angular` uses `assets` folder

---

## Example (Next.js)

Let's say that on my [`iamandrewluca.com`](https://iamandrewluca.com/) website I want to have addresses that redirect to my social profiles. This is a good example in case that you want someone to fast access your social profile, or in case you change it, Just change the redirect address e.g.

- `iamandrewluca.com/dev` ➡️ `dev.to/iamandrewluca`
- `iamandrewluca.com/github` ➡️ `github.com/iamandrewluca`
- `iamandrewluca.com/twitter` ➡️ `twitter.com/iamandrewluca`
- `...`

What I have to do now is to create 3 files in my `public` folder:

**public/dev.html**

```html
<meta http-equiv="Refresh" content="0; URL=https://dev.to/iamandrewluca" />
```

**public/github.html**

```html
<meta http-equiv="Refresh" content="0; URL=https://github.com/iamandrewluca" />
```

**public/twitter.html**

```html
<meta http-equiv="Refresh" content="0; URL=https://twitter.com/iamandrewluca" />
```

Next we build our static html application:

```shell
npm run build # build app
npx next export # export as static html
npx serve out # serve static at http://localhost:5000
```

Now if I access `http://localhost:5000/dev` it will automatically go to `https://dev.to/iamandrewluca`.

- No server
- No JavaScript.

![sponge bob magic](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0p0vj0k45lifg90a6ths.png)

You can check this live example on my simple website [iamandrewluca.com](https://iamandrewluca.com/)

---

## F.A.Q

> Why don't do this in javascript with `location.href`?

If you will do this in JavaScript you will have to wait the whole bundle of Js to load in browser then redirect, this takes time. Read also this [article](https://kentcdodds.com/blog/stop-using-client-side-route-redirects) from Kent C. Dodds

> What about redirect status code?

Unfortunately using this method you cannot set redirect status code, it will be a simple 200 status code, because it's a html served page.

> Why not use hosting service `redirects` functionality?

If your hosting service supports such thing, sure do. Should be event faster, and you can also change redirect status code

> How does browser know to open `/dev.html` from `/dev`?

This is not a browser thing, also server deals with this. Most servers have a list of static files to be served by default like: `*.html`, `index.html`, `index.php` and others. Also instead of `public/dev.html` you can have `public/dev/index.html`, will have same effect. Use this in case you need nested redirects.

> Where is `html` and `head` tag from HTML files?

Browsers automatically add these tags. Also less html, faster response.

> It is possible to use RegExp to catch multiple routes?

Unfortunately this is not possible.

## Bonus 🎁 🧨 🚀

[NPM Package](https://www.npmjs.com/package/html-redirections) that generates automatically HTML files from a JSON file!

Having **redirects.json**

```json
{
	"redirects": [
		{ "from": "/dev", "to": "https://dev.to/iamandrewluca" },
		{ "from": "/github", "to": "https://github.com/iamandrewluca" },
		{ "from": "/twitter", "to": "https://twitter.com/iamandrewluca" }
	]
}
```

And executing:

```
npx redirects.json out
```

Will generate all above files. You can add this step as a post build step.

![sponge bob finished](https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif)

That's all for today! Thanks for reading my blog posts!

---

Cover Photo by <a href="https://unsplash.com/@javiertenenbaum?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Javier Quiroga</a> on <a href="https://unsplash.com/s/photos/turn?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
