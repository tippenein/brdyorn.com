---
layout: post
title: Parser Combinatorz part2
tags: [parsers, haskell, parsec, regex]
---

### P▲rT2

In the [previous post](/2016/03/26/parser-combinators) I showed how to use
[parsec](https://www.stackage.org/package/parsec) to parse data in a format like this:

`"1%400:3.2 6%some_description|100:1"`

### Why not regex?

I certainly could've used a regex pattern like `\d\%(\w*\|)?(\d+):(\d+\.?\d?)`

...but, there are some scenarios where this falls apart quite quickly:

- if we learn about other formats of data that can be included
- if we have other parsing tasks that need similar matchers?
- if we need to morph the data in some way before matching
- if the list of possible separators are very large. (`\d\%|\$$|\&|...`)

### An example to prove I'm not making this up

I had never encountered the acronym FFR until I started working in financial
software. It stands for Fixed Format Response, but that's not really important.
The important part is that the FFR we're dealing with has ~100 different signals which indicate
a specific type of data.

So, we'll create a data type deriving `Enum` to describe how we expect to split the data up.

``` haskell

data Signal
  = AD02 | AD11 | AH11 | AM01 |
    AO01 | AR01 | AS01 | AT11 | BR01 |
    -- ... more of these removed for reading clarity
    UA11 | UF11 | VH01 | VS01 | WS01 |
    YI01 | ZC01
  deriving (Show, Enum, Ord, Eq, Read)

allSignals :: [String]
allSignals = map show [AD02 ..]

```

Note: The syntax for `allSignals` is just enumerating all the constructors. (The
space is significant  `[YourFirstEnum ..]`)

``` haskell
-- notice we're reusing this from the previous parser
anythingUntil p = manyTill anyToken p

anySignal :: Parser (Signal, String)
anySignal = do
  signal <- signalParser
  content <- anythingUntil (endOfLineOrInput <|> signalLookahead)
  return (toSignal signal, content)

signalLookahead = lookAhead signalParser *> return ()

signalParser :: Parser String
signalParser = choice $ fmap try $ string <$> allSignals

```

We're going to use the `anySignal` parser to pull out many pieces of content
from a string, but the interesting part is the `signalParser` itself. `choice`
and `<|>` are the same, but we need to choose between _all_ the signals so we
pass a list of Parsers. If it helps, it looks a bit like this if you were to
expand it:

``` haskell
choice [(try $ string "AD02"), (try $ string "AD11"), ...]
```

Another thing to note is the `signalLookahead`. We need to avoid eating up the
next signal and just use it to signal the end of input.

Once again, there's a freeze of the jupyter notebook if you'd like to see it in the full context ([here](/slides/ffrparse))

### Further processing

There are many more things we can do with our data in this format, but the first thing I would do is consume the data into some Map like this:

``` haskell
type SignalMap = Map.Map Signal String
```

From here we'd want to inspect what each signal has inside of it, so we can
take from this `Map` and further parse the string content.

### Credit

Thanks a bunch to both of these resources (which are far both better and more comprehensive than this):

- [https://github.com/JakeWheat/intro_to_parsing](https://github.com/JakeWheat/intro_to_parsing)
- [http://unbui.lt/#!/post/haskell-parsec-basics/](http://unbui.lt/#!/post/haskell-parsec-basics/)
