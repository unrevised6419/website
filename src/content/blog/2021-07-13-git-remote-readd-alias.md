---
title: 🔧 Git remote readd alias
published: true
tags: github, git, alias, remote
series: git
cover_image: glenn-carstens-peters-EOQhsfFBhRk-unsplash.jpg
---

> **tl;dr** Alias for removing Git remote and adding it back

```shell
git config --global alias.readd '!f() { REMOTE=$(git config --get remote."$1".url); git remote remove "$1"; git remote add "$1" "$REMOTE"; }; f'
```

```shell
git readd remote-name
```

When you work on a project that has a repository that allows forks, and with time has more and more recurring contributors, your git remotes starts to add up.

`git remote -v`

```shell
ion     git@github.com:ion-golovco/catalog-profesii.git (fetch)
ion     git@github.com:ion-golovco/catalog-profesii.git (push)
origin  git@github.com:code4moldova/catalog-profesii.git (fetch)
origin  git@github.com:code4moldova/catalog-profesii.git (push)
radu    git@github.com:Raduc4/catalog-profesii.git (fetch)
radu    git@github.com:Raduc4/catalog-profesii.git (push)
sergiu  git@github.com:YoSoySergio/catalog-profesii.git (fetch)
sergiu  git@github.com:YoSoySergio/catalog-profesii.git (push)
```

And if you are a person that keeps an eye on the repository graph and likes everything to be clean, you will start to see a lot of stale branches from other remotes that were not deleted after PR merge.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lcn1egedajksc7t65kwq.png)

This happens, because most of the times, the maintainer checks out locally the branch from PR and does some small adjustments without bothering the contributor.

You can still remove the local branches after PR merge, but remote references will stay there till the contributor will not delete them from remote, because only contributor has the permission to delete branches from his fork, or who has write permissions.

GitHub a year ago introduced a solution for this. It allows you to delete the branch automatically after PR was merged.

https://docs.github.com/en/github/administering-a-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches

The only solution is to remove the remote, and all the references will dissapear. But we want to keep the remotes for future, so we don't have to add it again.

So we have to remove the remote, then add it back.

Using the classical way, I would do this steps:

- use `git remote -v` to list all remotes
- copy URL of desired remote
- delete remote with `git remote remove name-of-remote`
- add remote with `git remote add name-of-remote PASTE_URL`

After some time I saw that I repeat this pattern more and more, so I decided to create a git alias for it.

```shell
git config --global alias.readd '!f() { REMOTE=$(git config --get remote."$1".url); git remote remove "$1"; git remote add "$1" "$REMOTE"; }; f'
```

And it's usage would be like this:

```shell
git readd remote-name
git readd origin
git readd upstream
# ...
```

Let's simplify that one liner and understand what is happening there.

So Git allows you to add aliases like this.

```shell
git config --global alias.alias-name 'log -1 HEAD'
```

As you can tell, Git simply replaces the new command with whatever you alias it for. However, maybe you want to run an external command, rather than a Git subcommand. In that case, you start the command with a `!` character.

In our case our external command is a simple bash function, and in the end we call that function. (`...` remaining content)

```shell
git config --global alias.readd '!f() { ... }; f'
```

Now let's inline the remaining content

```shell
REMOTE=$(git config --get remote."$1".url);
git remote remove "$1";
git remote add "$1" "$REMOTE";
```

So basically I do exactly same 3 steps above, but automated.

- get remote URL with `git config --get remote."$1".url`
- store in `REMOTE` the result
- remove the remote `"$1"`
- add remote with name `"$1"` with url `REMOTE` created before

`"$1"` represents the argument that was passed to alias

So, in the end I run:

```shell
git readd ion
git readd radu
git readd sergiu
```

And got this result, much cleaner.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/l11k2me1ijibcseup809.png)

If you are still here, thanks for reading my blog post 🙂

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/crtgoc5zvfe4onytwevz.png)

Cover image by <a href="https://unsplash.com/@glenncarstenspeters?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/s/photos/remote?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
