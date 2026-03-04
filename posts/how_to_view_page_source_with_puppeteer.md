---

title: "How to View Page Source Using Puppeteer (What Actually Matches view-source:)" description: "A precise comparison of Puppeteer techniques to extract HTML, proving which one is identical to Chrome view-source: and why the others differ." date: 2025-12-25 tags:

- puppeteer
- web-scraping
- chromium
- devtools

---

# How to View Page Source Using Puppeteer (What Actually Matches `view-source:`)

Developers routinely misuse the term _page source_. In Chromium there is a strict distinction between:

1. **The document response body** (what `view-source:https://…` shows)
2. **The parsed / normalized DOM** (DevTools → Elements)
3. **The mutated DOM after JavaScript execution**

Only **(1)** is _page source_ in the literal sense. Puppeteer exposes all three—but only one category is _byte-for-byte identical_ to `view-source:`.

This article compares the common Puppeteer approaches and demonstrates—provably—which one matches `view-source:` and why the others do not.

---

## Terminology (non-negotiable)

- **Page source** = raw HTML response body of the _Document_ request
- **DOM HTML** = serialized browser DOM (may include implied or injected nodes)
- **Rendered output** = DOM after JS execution and framework hydration

If your output contains injected `<html>`, `<head>`, or reordered nodes, you are _not_ looking at page source.

---

## Option 1 — `page.content()` (DOM snapshot, not page source)

```js
const domHtml = await page.content();
```

### What it returns

- A serialization of the **current DOM tree**

### Why it differs from `view-source:`

- Browser parser implicitly inserts `<html>`, `<head>`, `<body>` if missing
- JavaScript mutates the DOM
- Frameworks (React, Vue, Angular) rewrite structure

### Verdict

❌ **Not page source**. This is a _post-parse_ artifact.

---

## Option 2 — `response.text()` from `page.goto()` (document response body)

```js
const response = await page.goto(url, { waitUntil: "domcontentloaded" });
const sourceHtml = await response.text();
```

### What it returns

- The **HTTP response body** of the navigation’s final _Document_ request

### Relation to `view-source:`

- This is the same payload Chromium uses for `view-source:`

### Common misconception

When people say this is “decorated,” they are usually comparing it to **DOM output**, not to the actual `view-source:` content.

### Verdict

✅ **Page source**, assuming you captured the correct document response.

---

## Option 3 — Listening for `resourceType() === "document"` (also page source)

```js
let docHtml;

page.on("response", async (res) => {
	if (res.request().resourceType() === "document") {
		docHtml = await res.text();
	}
});

await page.goto(url, { waitUntil: "domcontentloaded" });
```

### What it returns

- The response body of the **Document** request

### Why people believe this is the “only real one”

- It avoids ambiguity in complex redirect chains
- It works cleanly with iframes and multi-document navigations

### Important clarification

Option 2 and Option 3 return the **same class of data**. If they differ, you captured _different document responses_, not a more or less “decorated” version.

### Verdict

✅ **Page source** (same category as Option 2)

---

## Proving equivalence: hashing DOM vs response body

The fastest way to kill the debate is to hash the outputs.

```js
import crypto from "node:crypto";

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

console.log("DOM === Source:", hash(domHtml) === hash(sourceHtml));
```

Expected outcome:

- `DOM === Source` → **false** (often)
- `goto() response === response listener` → **true**

If not, you grabbed different responses.

---

## Gold standard: Chrome DevTools Protocol (canonical page source)

For absolute certainty, extract the response body directly from Chromium’s Network domain.

```js
const cdp = await page.createCDPSession();
await cdp.send("Network.enable");

let documentRequestId;

cdp.on("Network.responseReceived", (evt) => {
	if (evt.type === "Document") {
		documentRequestId = evt.requestId;
	}
});

await page.goto(url, { waitUntil: "domcontentloaded" });

const { body, base64Encoded } = await cdp.send("Network.getResponseBody", {
	requestId: documentRequestId,
});

const source = base64Encoded
	? Buffer.from(body, "base64").toString("utf8")
	: body;
```

This payload is the closest possible equivalent to what `view-source:` renders.

---

## About `view-source:` navigation itself

```js
await page.goto(`view-source:${url}`);
const text = await page.$eval("pre", (el) => el.innerText);
```

Notes:

- Chromium wraps output for display
- Whitespace and escaping may differ
- Semantically equivalent, not byte-for-byte guaranteed

Useful for demos. Not ideal for extraction.

---

## Final comparison table

| Method                | Matches `view-source:` | Reason                  |
| --------------------- | ---------------------- | ----------------------- |
| `page.content()`      | ❌ No                  | DOM serialization       |
| `page.goto().text()`  | ✅ Yes                 | Document response body  |
| `response` listener   | ✅ Yes                 | Same document response  |
| CDP `getResponseBody` | ✅ Canonical           | Browser-internal source |

---

## Bottom line

- **Page source is a network artifact, not a DOM artifact**
- If `<html>` magically appears, you are already too late
- `page.content()` is for scraping rendered pages—not for inspecting source

If you care about correctness, treat the **Document response body** as the only authoritative definition of _page source_.
