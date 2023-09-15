---
title: 🚧 Configure MSW in NX
published: true
tags: msw, nx, javascript, typescript
cover_image: sat8qubuqffxtyxeubt3.webp
---

> Mock Service Worker (MSW) is an API mocking library for browser and Node.
> — https://mswjs.io/

---

> Nx is a set of extensible dev tools for monorepos, which helps you develop like Google, Facebook, and Microsoft.
> — https://nx.dev/

---

To get started with `nx` just execute

```shell
yarn create nx-workspace
```

And it will assist you to setup your monorepo.

After you are done with monorepo setup, go into that directory and install `msw`

```shell
yarn add --dev msw
```

`msw` is using a service worker that handles all requests. Execute bellow command to to generate a service worker file that will be loaded in your app.

```shell
yarn msw init apps/your-app-name/src
```

Now you should have a new file in your repo

```
apps/your-app-name/src/mockServiceWorker.js
```

Next step is to include this file in our app assets.
Open your `workspace.json` file and find `assets` array located at this path

```
/projects/your-app-name/architect/build/options/assets
```

and include `msw` created file in `assets` array

```json
{
	"projects": {
		"your-app-name": {
			"architect": {
				"build": {
					"options": {
						"assets": [
							"apps/your-app-name/src/favicon.ico",
							"apps/your-app-name/src/assets",
							"apps/your-app-name/src/mockServiceWorker.js"
						]
					}
				}
			}
		}
	}
}
```

Now we have to create a file where we will create all our request handlers. This file will be created at this location.

```
apps/your-app-name/src/mocks.ts
```

And add some handler in `mocks.ts`

```ts
import { setupWorker, rest } from "msw";

const myResourceHandler = rest.get("/api/my-resource", (req, res, ctx) =>
	res(
		ctx.status(200),
		ctx.json({
			items: [],
		}),
	),
);

const worker = setupWorker(myResourceHandler);

worker.start();
```

To hook `msw` into our app, open file

```
apps/your-app-name/src/main.ts
# or main.tsx if you are using React
apps/your-app-name/src/main.tsx
```

And import `mocks.ts` at the top of the file

```ts
import "./mocks";
// ...
```

Start the app

```shell
yarn start --open
```

Now if you will make a fetch request to `/api/my-resource` you will get the response that was configured in `mocks.ts`

```js
await fetch("/api/my-resource").then((res) => res.json());
```

This should be your response.

```json
{
	"items": []
}
```

We are almost done. `msw` is not recommended to be used in production. We have to do some changes to `workspace.json` so this service worker will be included only in development mode.

Find this location in `workspace.json`

```
/projects/your-app-name/architect/build/configurations/production
```

Duplicate `assets` array from `/projects/your-app-name/architect/build/options/assets` and exclude `mockServiceWorker.js` file

```json
{
	"projects": {
		"your-app-name": {
			"architect": {
				"build": {
					"configurations": {
						"production": {
							"assets": [
								"apps/your-app-name/src/favicon.ico",
								"apps/your-app-name/src/assets"
							]
						}
					}
				}
			}
		}
	}
}
```

Last thing we have to do, is to exclude `mocks.ts` file from production.

Create a new empty file `mocks.prod.ts`, and in production this empty file will replace `mocks.ts` using `fileReplacements` option

Find in `workspace.json`, array `fileReplacements` located at

```
/projects/your-app-name/architect/build/configurations/production/fileReplacements
```

And add a new replacement for our files.

```json
{
	"projects": {
		"your-app-name": {
			"architect": {
				"build": {
					"configurations": {
						"production": {
							"fileReplacements": [
								{
									"replace": "apps/your-app-name/src/environments/environment.ts",
									"with": "apps/your-app-name/src/environments/environment.prod.ts"
								},
								{
									"replace": "apps/your-app-name/src/mocks.ts",
									"with": "apps/your-app-name/src/mocks.prod.ts"
								}
							]
						}
					}
				}
			}
		}
	}
}
```

We are done. Enjoy your monorepo setup.
