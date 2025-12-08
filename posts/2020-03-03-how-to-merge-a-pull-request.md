---
title: 🔥 How to merge a pull request
description: Rules to take into consideration when merging a pull request
tags: github, git, repository, gitlab
created_at: "2020-03-03T12:48:25.264Z"
edited_at: "2021-10-06T15:46:50.716Z"
published_at: "2020-03-03T12:48:25.243Z"
---

There are some rules that are best to follow when merging a pull request.

When merging a pull request, GitHub offers 3 options:

- `Create a merge commit`
- `Squash and merge`
- `Rebase and merge`

We should use each of them depending of the situation:

- If PR has only one commit and commit explains well what was done use `Rebase and merge`
- If PR has only one commit but commit does not explain exactly what was done use `Squash and merge` and add commit name that will explain more exactly what was done
- If PR has more commits but they are intermediary (ex: fix style, add object, remove test ) also use `Squash and merge` and add a commit name that will group all commits in one
- If PR has more commits but every commit has an explicit title what has been done, each commit is a single unit, then use `Create a merge commit` so each commit will be visible in default branch

If you want to read more about how to write correct commit messages, follow the link https://conventionalcommits.org
