---
layout: post
title: Let's play 'Feature or Defect!'
---

### Lolwhut?!

Sometimes you run into programming language "features" that make you wonder if that was the intended effect. This particular one involves python and a mutable default function argument. Here's a quick example:

<!--more-->

    >>> def foo(a=[]):
    ...   a.append(1)
    ...   return a
    ... 
    >>> foo()
    [1]
    >>> foo()
    [1, 1]
    >>> foo()
    [1, 1, 1]
    >>> foo()
    [1, 1, 1, 1]

On the one hand, this can be used as a weird little way of caching items. Since `a` is mutable, it acts as a global variable. To me, this is counterintuitive. If I say, `def foo(a=[]):` I expect `a` to be an empty list every time I run that function unless I tell it otherwise.
