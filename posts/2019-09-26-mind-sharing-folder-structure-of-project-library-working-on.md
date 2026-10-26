---
title: 🗂️ What is the folder structure of project/library working on?
og_title: "🗂️ What is the folder structure of your project/library?"
description: >-
    How I lay out the folders of an app and of a library, following the Angular
    style guide, with the tree output of each one.
og_description: "How I lay out the folders of an app and of a library, following the Angular style guide, with the tree output of each one."
tags: library, react, typescript, tree
created_at: "2019-09-26T08:48:05.247Z"
edited_at: "2023-09-15T17:11:22.515Z"
published_at: "2019-09-26T08:48:05.234Z"
---

Every project starts with the same question: where do the files go? Here's how I lay out the folders of an app and of a library, and the style guide I lean on so I don't have to decide from scratch every time.

Follow Angular style guide https://angular.io/guide/styleguide

```
tree -I 'node_modules|build'
```

An app

{% gist https://gist.github.com/unrevised6419/660904bf6f3715fb82d6781e685cdced %}

A library

{% gist https://gist.github.com/unrevised6419/f5073dbcd8443ecf0cd9dbd4b2b83aa2 %}
