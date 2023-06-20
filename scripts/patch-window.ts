import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow({
	url: "http://localhost:8080",
});
const document = window.document;
const navigator = window.navigator;

// @ts-expect-error
globalThis.window = window;
// @ts-expect-error
globalThis.document = document;
// @ts-expect-error
globalThis.navigator = navigator;

export { document };
