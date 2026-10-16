---
title: 🔗 Don't return early from React.Component when using React.createRef
og_title: "🔗 Don't return early in React.Component with createRef"
description: >-
    A note proposed for the React docs: return early from render in a
    React.Component and a React.createRef ref may never attach.
og_description: "A note proposed for the React docs: return early from render in a React.Component and a React.createRef ref may never attach."
tags: react, javascript, refs, dom
created_at: "2018-12-03T15:16:57.996Z"
edited_at: "2023-09-15T17:12:28.503Z"
published_at: "2019-05-15T08:27:08.082Z"
---

A ref created with `React.createRef` can quietly stay `null` in a class component, with no error and no warning. I ran into one case where that happens, and it was subtle enough that I proposed a note for the official React docs.

{% github https://github.com/reactjs/reactjs.org/pull/1456 %}
