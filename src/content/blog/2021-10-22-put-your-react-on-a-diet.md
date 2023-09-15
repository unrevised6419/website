---
title: 🥑 Put your React on a diet
published: true
tags: react, preact, npm, roataway
cover_image: brooke-lark-jUPOXXRNdcA-unsplash.jpg
---

For a long time I heard people complaining that [`React & ReactDOM`](https://reactjs.org/) has a huge size, and everyone recommended to use [`Preact`](https://preactjs.com/) instead.

> `react` & `react-dom` bundle
> https://bundlephobia.com/package/react > https://bundlephobia.com/package/react-dom > `preact` bundle
> https://bundlephobia.com/package/preact

Me personally never had the opportunity to try and migrate a `React` app to `Preact` till today.

Chișinău, capital of Moldova has public transport tracking. And we Open Source enthusiasts made a simple app that shows on a map, live location of desired trolleybuses. [Roata Wăy](https://roataway.md/)

We are using [Create React App](https://create-react-app.dev/) and some other `React` third party libraries.

In docs `Preact` says you need to alias `react` and `react-dom` to `preact/compat` for everything to work. But here we have a problem, `create-react-app` does not allow aliases by default, you need to eject or use `@craco/craco` or `react-app-rewired`.

Because I didn't wanted to add any more configuration to the project, I started to analyse internals of `create-react-app` maybe I can find any backdoors. Nothing found.

Then I remembered two ways you can install packages using [npm](https://www.npmjs.com/)

**1. Install package (e.g. `my-package`) from local directory**

```shell
npm install ../package-directory
```

This will add in `package.json` such a line:

```json
"my-package": "file:../package-directory",
```

**2. Install package under a different name**

```shell
npm install custom-name@npm:react
```

This will add in `package.json` such a line:

```json
"custom-name": "npm:react@^17.0.2",
```

And I realised that `npm:` is just the protocol, and we can use other protocols, like `file:`

And what I did next, was amazing to me 😀

Install Preact dependency

```shell
npm install preact
```

Install `preact/compat` folder under `react` and `react-dom` name combining both methods

```shell
npm install react@file:node_modules/preact/compat
npm install react-dom@file:node_modules/preact/compat
```

`package.json` changes:

```json
"preact": "^10.5.15",
"react": "file:node_modules/preact/compat",
"react-dom": "file:node_modules/preact/compat",
```

![magic shia](https://media.giphy.com/media/Uxma5LRUa5VAI/giphy.gif)

And create this script.

```shell
npm set-script postinstall "rm -f node_modules/react/src/index.d.ts"
```

This will remove `preact/compat` types so TypeScript can consume `@types/react` instead.

`npm run start` and Boom 💥 our app is working 🚀 and we got rid of almost 34KB from bundle.

There is no need to configure your build system at all. It just works!

> [Pull Request with changes](https://github.com/roataway/roataway-web/pull/153) > [Netlify Build Details ](https://app.netlify.com/sites/roataway/deploys/61721171aa8d4d00086a89d2) > [Application Preview](https://deploy-preview-153--roataway.netlify.app/)

That's all for today! Bye!

![girl sliding](https://media.giphy.com/media/m9eG1qVjvN56H0MXt8/giphy.gif)

---

Cover Photo by <a href="https://unsplash.com/@brookelark?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Brooke Lark</a> on <a href="https://unsplash.com/s/photos/diet?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
