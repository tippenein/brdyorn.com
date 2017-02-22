---
layout: post
title: Reflex Template
tags: [frp, haskell, ghcjs, reflex, haskeleton, template]
---

## Project Bootstrapping!

I'm announcing a Reflex FRP bootstrapping template!

You can use it now if you have [hi](https://github.com/fujimura/hi) installed.

```shell
hi some_project --repository git://github.com/tippenein/haskeleton-reflex.git
cd some_project
make
```

## What it gives you

- stack for dependencies
- small base of common widgets and helpers (which I'll continue to add to)
- a baseline Model/View/Update logic.

The intention is to be able to start right in by adding your `Action`'s and `Model` attributes and have them already plugged into the simple reflex event fold.


## Other options

The [reflex-platform](https://github.com/reflex-frp/reflex-platform) is the official way supported by reflex for development, so this project is for people who want a reference on a working Stack config or people who are simply too stubborn to move to nix.
