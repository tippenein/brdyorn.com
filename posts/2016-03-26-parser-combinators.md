---
layout: post
title: Parser Combinatorz part1
tags: [parsers, haskell, parsec]
---

### The value of composable parts

I've found myself in some strange parsing tasks lately. This is a new thing for
me, so don't take this post as an example of the best practices for parsing.
However, FWIW, all the parsers _work_.

### The Setup

Say we have data that looks something like:

`"1%400:3.2 6%some_description|100:1"`

First we decide what we're trying to pull out of this. These values happen to
be space separated so we can just use the Prelude's `words`

``` haskell
words theString
> ["1%400:3.2", "6%some_description|100:1"]
```

Each string in this list we'll call a `Feature` so we write a data type for it:

``` haskell
data Feature
  = Feature
  { row        :: String
  , col        :: String
  , value      :: String
  , descriptor :: Maybe String
  } deriving (Show)
```

Notice that we're just reading this in as String data at the moment, but we can
easily change that once we get the parsing structure down.

Anyway, almost done with the easy stuff. We need to pull the garbage data out somehow.
That's cool, we'll just write out our signal matchers.

``` haskell
breakSep = string "%"
kvSep = string ":"
descriptionSep = string "|"
```

### The Actual Parsing

Since we'll be slurping up data until we hit one of the above defined
separators, we'll make a parser to do just that:

``` haskell
anythingUntil :: Parser String -> Parser String
anythingUntil p = manyTill anyToken (p *> return ())
```

This function eats up any type of input until it hits one of our separators and
returns everything before it.

The way we'll use this is pretty simple

``` haskell

featureP :: Parser Feature
featureP = do
  row <- anythingUntil breakSep
  desc <- descriptorP
  col <- anythingUntil kvSep
  value <- manyTill anyToken eof -- get the remaining
  return $ Feature row col value desc

```

Now we need to fill in the optional `descriptor` parser

``` haskell
descriptorP :: Parser (Maybe String)
descriptorP = optionMaybe $ try $ anythingUntil descSep
```

`optionMaybe` allows us to optionally consume some data and return a Maybe value.

Since the anythingUntil parser _can_ fail in this case, we need to use
`try` to save us from erroring out.

### The Benefit over X

Personally, I find this easier to reason about than a regex or generic
string functions. The point here is that I can easily expand on this and add
new detailed parsers (This will be covered in [part 2](/posts/2016-03-27-parser-combinators2.html))

I've included a snapshot of the ihaskell session I was working in for full context [here](/slides/features_ipynb.html)
