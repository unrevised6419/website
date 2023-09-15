---
title: ♻️ Override DOM input typed character
published: true
description:
tags: javascript, dom, input, event
---

### Problem trying to solve.

Map every keyboard (input source / layout) back to EN-US.
Why would I want to do this, you ask?

At work we have a QRcode scanner that can be connected to any machine (via USB), and it will simulate some keyboard input when you scan a QRcode.

Scanner works with US Standard 101 layout (EN-US), and it knows for example that character `Y` has scancode `0x1c` and `Z` will have scancode `0x1d`, and it will simulate a scancode for a specific key on keyboard ([USB keyboard scancodes](https://www.win.tue.nl/~aeb/linux/kbd/scancodes-14.html)).

For example we have a QRcode that represent this URl.

```
https://amayzyng.com/iamandrewluca
```

This will type QRcode scanner for 5 keyboard (input source / layout)

```
// English (ABC)
https://amayzyng.com/iamandrewluca

// German (ABC - QWERTZ)
httpsÖ--amazyzng.com-iamandrewluca

// Dvorak
dyyloSzzamaf;fbivjrmzcamabep.,ngja

// Russian
реезыЖ//фьфнянипюсщь/шфьфтвкуцдгсф

// Romanian - Standard
httpsȘ//amayzyng.com/iamandrewluca
```

As you see the results for each one are the same 🙃
This is why we need to map US Standard 101 layout scancodes to EN-US

### Requirements

Solution is based on [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) that represents physical code of the key. Also `KeyboardEvent.code` (status: Working Draft) is not supported in all browsers.

![KeyboardEvent.code browser support](https://thepracticaldev.s3.amazonaws.com/i/xi7h6yeduabkcau0u5c0.png)

Here is a [polyfill](https://github.com/inexorabletash/polyfill/blob/master/keyboard.md) if you want to support more browsers

### Solution for the problem. Let's get started!

This is the only piece of `HTML` you'll see in this post 🙂  
The rest will be mighty `JavaScript`

```html
<input type="text" />
```

First of all let see what are most events used on an input, and in what order they are trigerred.

```javascript
const input = document.querySelector("input");

input.addEventListener("focus", info);
input.addEventListener("keydown", info);
input.addEventListener("keypress", info);
input.addEventListener("input", info);
input.addEventListener("keyup", info);
input.addEventListener("change", info);
input.addEventListener("blur", info);

function info(event) {
	console.log(event.type, event.target.value);
}
```

The only way to catch typed character into input is to watch for `keypress` event.  
At this phase character does not appear in `input.value`

```javascript
function onFocus(event) {
	info(event);
}
function keyDown(event) {
	info(event);
}
function keyPress(event) {
	info(event);
	// this 2 calls will stop `input` and `change` events
	event.preventDefault();
	event.stopPropagation();

	// get current props
	const target = event.target;
	const start = target.selectionStart;
	const end = target.selectionEnd;
	const val = target.value;

	// get some char based on event
	const char = getChar(event);

	// create new value
	const value = val.slice(0, start) + char + val.slice(end);

	// first attemp to set value
	// (doesn't work in react because value setter is overrided)
	// target.value = value

	// second attemp to set value, get native setter
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	).set;
	nativeInputValueSetter.call(target, value);

	// change cursor position
	target.selectionStart = target.selectionEnd = start + 1;

	// dispatch `input` again
	const newEvent = new InputEvent("input", {
		bubbles: true,
		inputType: "insertText",
		data: char,
	});
	event.target.dispatchEvent(newEvent);
}
function keyUp(event) {
	info(event);
}
function onInput(event) {
	info(event);
}
function onChange(event) {
	info(event);
}
function onBlur(event) {
	// dispatch `change` again
	const newEvent = new Event("change", { bubbles: true });
	event.target.dispatchEvent(newEvent);
	info(event);
}

function info(event) {
	console.log(event.type);
}

function getChar(event) {
	// will show X if letter, will show Y if Digit, otherwise Z
	return event.code.startsWith("Key")
		? "X"
		: event.code.startsWith("Digit")
		? "Y"
		: "Z";
}
```
