---
title: 🍂 Remove gone git branches
published: true
tags: github, git, gitlab, bitbucket
series: git
cover_image: birti-ishar-wHLTo7uLaxk-unsplash.jpg
---

> **tl;dr** Alias for removing local branches that are gone on remote

```properties
# ~/.gitconfig file
[alias]
	gone = "!f() { git fetch --all --prune; git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D; }; f"
```

```shell
git gone
```

If your git workflow is using Pull Requests that are merged into main branch, after a while your local list of branches will get very messy, because most of the time the PR is merged and remote branch is deleted.

However on local you just create a new branch from main for a new feature/fix, and you leave the previous branch behind without deleting it.

Let's start with this, list all local branches with their remotes

```shell
git branch -vv
```

```text
  feature-1 4ea9770 [origin/feature-1] test commit
  feature-2 4ea9770 [origin/feature-2] test commit
  feature-3 4ea9770 [origin/feature-3] test commit
  feature-4 4ea9770 [origin/feature-4] test commit
  feature-5 4ea9770 [origin/feature-5] test commit
  feature-6 4ea9770 [origin/feature-6] test commit
  feature-7 4ea9770 [origin/feature-7] test commit
* main      4ea9770 [origin/main] test commit
```

Next we remove some remote branches, fetch remote info, and list branches again

```shell
git fetch --prune
git branch -vv
```

```text
  feature-1 4ea9770 [origin/feature-1: gone] test commit
  feature-2 4ea9770 [origin/feature-2] test commit
  feature-3 4ea9770 [origin/feature-3: gone] test commit
  feature-4 4ea9770 [origin/feature-4] test commit
  feature-5 4ea9770 [origin/feature-5] test commit
  feature-6 4ea9770 [origin/feature-6] test commit
  feature-7 4ea9770 [origin/feature-7: gone] test commit
* main      4ea9770 [origin/main] test commit
```

![travolta confused](https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif?cid=ecf05e47iu01qeuvc6pgymjyfall0i0soact78iv2udjr3nf&rid=giphy.gif&ct=g)

As you can see there are some lines that have `gone`, that means that the remote branch is gone, so `origin/feature-1`, `origin/feature-3`, `origin/feature-7` remote branches don't exist anymore, but we still have them locally. And with time this list can get very big.

Let's get back to our alias. Now that we have this `gone` keyword in the branch list, we can hook in and get the branch name and delete it. For example to manually delete `feature-7` we would do:

```shell
# Fetch info for all remotes and prune info of missing remote branches
git fetch --all --prune
# List all branches to see what is gone
git branch -vv
# Delete desired branch
git branch -D feature-7
```

Now let's combine all these 3 into a single one liner 🚀

```shell
git fetch --all --prune; git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D;
```

Here we use pipe (`|`) operator to pass output from one command to another pipe.

|                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- |
| `git fetch --all --prune` just fetches remotes info                                                              |
| `git branch -vv` list branches and pipes output lines to awk                                                     |
| `awk '/: gone]/{print $1}'` find lines with `gone`, select first column (which is branch name) and pipe to xargs |
| `xargs git branch -D` takes received branches names and deletes them                                             |

And to make this one liner a [git alias](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases) we put it into a function that will be called 💻

You can add manually the alias in your `~/.gitconfig` file

```properties
# ~/.gitconfig file
[alias]
	gone = "!f() { git fetch --all --prune; git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D; }; f"
```

Or follow these steps. Usually is a single line, but because of multiple quotes, double quotes and dollar signs we have to do it in multiple steps using a temporary file:

Put the alias code in `alias` temporary file

```shell
echo "f() { git fetch --all --prune; git branch -vv | awk '/: gone]/{print \$1}' | xargs git branch -D; }; f" > alias
```

Consume `alias` file for git alias command

```shell
git config --global alias.gone "!`cat alias`"
# remove temporary created file
rm alias
```

Now let's do a full demo 😮‍💨

```shell
git branch -vv
```

```text
  feature-1 4ea9770 [origin/feature-1] test commit
  feature-2 4ea9770 [origin/feature-2] test commit
  feature-3 4ea9770 [origin/feature-3] test commit
  feature-4 4ea9770 [origin/feature-4] test commit
  feature-5 4ea9770 [origin/feature-5] test commit
  feature-6 4ea9770 [origin/feature-6] test commit
  feature-7 4ea9770 [origin/feature-7] test commit
* main      4ea9770 [origin/main] test commit
```

Next I deleted all feature branches on remote. And call `git gone`

```shell
git gone
```

```text
Fetching origin
From /Users/iamandrewluca/Temp/gone-bare
 - [deleted]         (none)     -> origin/feature-1
 - [deleted]         (none)     -> origin/feature-2
 - [deleted]         (none)     -> origin/feature-3
 - [deleted]         (none)     -> origin/feature-4
 - [deleted]         (none)     -> origin/feature-5
 - [deleted]         (none)     -> origin/feature-6
 - [deleted]         (none)     -> origin/feature-7
Deleted branch feature-1 (was 4ea9770).
Deleted branch feature-2 (was 4ea9770).
Deleted branch feature-3 (was 4ea9770).
Deleted branch feature-4 (was 4ea9770).
Deleted branch feature-5 (was 4ea9770).
Deleted branch feature-6 (was 4ea9770).
Deleted branch feature-7 (was 4ea9770).
```

![magician focus gone](https://media.giphy.com/media/Jls16O6RdqyxueMvBj/giphy.gif)

I like my local repo to always be clear. And in the past I had always to check what branches are deleted on remote and delete them also locally. Now I don't have to remember anything. Just `git gone`

Are you still here? 😊 Thanks for reading my blog posts! 🎉 🎈

[You'll miss me when I'm gone ♥️](https://youtu.be/2O20C6KGZLg)

---

Initial idea by <a href="https://twitter.com/devgummibeer">Tom Witkowski</a> on <a href="https://twitter.com/devgummibeer/status/1425014391561412629">Twitter</a>

Cover Photo by <a href="https://unsplash.com/@birtiishar?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Birti Ishar</a> on <a href="https://unsplash.com/s/photos/gone?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
