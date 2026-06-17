---
title: 🩹 Migrate from patch-package to pnpm patch
description: >-
  tl;dr A few simple steps to migrate your existing patch-package patches to
  pnpm patch. You can even batch...
tags: pnpm, patch-package, npm, node
created_at: "2026-06-17T09:30:00.000Z"
published_at: "2026-06-17T10:00:00.000Z"
---

> **tl;dr** A few simple steps to migrate your existing [`patch-package`](https://github.com/ds300/patch-package) patches to [`pnpm patch`](https://pnpm.io/cli/patch).

If you moved your project to [pnpm](https://pnpm.io/), you probably still have a `patches/` folder full of `patch-package` patches. pnpm has its own patching mechanism built in, so there is no need to keep `patch-package` around as an extra dependency.

The catch is that the two tools use a slightly different patch format. The diff content is the same, only the paths inside the patch point to a different location. So migrating is mostly a find & replace.

This came up in [pnpm#10087](https://github.com/pnpm/pnpm/issues/10087) where a conversion command was requested. Until that lands, here is how to do it by hand.

> 💡 You can even batch these commands for multiple patches at once. For each step duplicate the command for each package, it should work. I migrated 5 patches in 1 minute.

#### 1. Create a pnpm temporary patch folder

```bash
pnpm patch <package-name>
```

This prints a temporary folder where pnpm extracts the package so you can edit it.

#### 2. Open the existing patch

```
patches/<package-name>+<version>.patch
```

#### 3. Replace all occurrences of the path

Replace every occurrence of

```
node_modules/<package-name>
```

with the new folder created by pnpm

```
node_modules/.pnpm_patches/<package-name>@<version>
```

This is the only real difference between the two formats, the paths.

#### 4. Apply the patch with `git apply`

```bash
git apply patches/<package-name>+<version>.patch
```

Now the temporary folder contains your changes, just as if you had edited them by hand.

#### 5. Commit the patch with pnpm

```bash
pnpm patch-commit /Users/me/my-project/node_modules/.pnpm_patches/<package-name>@<version>
```

pnpm now generates its own patch and wires it up in `pnpm-workspace.yaml` (or `package.json`) under `patchedDependencies`.

> 📝 pnpm patches are created as `patches/<package-name>.patch` (without the version in the file name)

#### 6. Remove the old `patch-package` patch

```bash
rm patches/<package-name>+<version>.patch
```

And that's it! Repeat for every patch, and once the folder is clean you can also remove `patch-package` and its `postinstall` script from your `package.json`.

Thanks for reading my blog posts! 🎉
