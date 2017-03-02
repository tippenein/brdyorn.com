---
layout: post
title: Norvigs spell correct in Haskell
tags: [haskell, python, performance]
---

Peter Norvig has an [old post](http://norvig.com/spell-correct.html) about writing a spell checker which I've always loved the succinctness of. I was on a plane for a few hours and wanted to see how this translated from python to haskell. This is the tale of the journey which I did not intend to take.

## Keeping the same structure

First step was going through and recreating the main functionality which is mainly lists and sets, so, no big deal.

## Splitting

We split the raw text into words

```haskell
words :: Text -> [Text]
words = T.split (not . Char.isAsciiLower) . T.toLower
```

This code is the intuitive answer to the problem above, however it's very slow. We'll look at performance later in this post.

## Counter / Bag

In python, the `Counter` is implemented as a multiset / "bag". We'll create our own with a Map from `Text` (word) to `Int` (count)

```haskell
type Counter = Map Text Int

toCounter :: [Text] -> Hist
toCounter = Map.fromListWith (+) . fmap (,1)

words <- toCounter . words <$> readFile "big.txt"
```

There is also a package called `multiset` but I didn't know this because the wifi on the plane didn't work.

## Probability and Correction

In order to guess the right way of correcting we need to have probabilities based on the corpus' word counts.

```haskell
prob :: Counter -> Text -> Int
prob counter word = occurences `div` totalWords
  where
    occurences = fromMaybe 0 $ Map.lookup t counter
    totalWords = Map.size ms

correction :: Counter -> Text -> Text
correction counter word = maximumBy (\a b -> p a `compare` p b) $ candidates counter word
  where p = prob counter
```

```haskell
candidates :: Counter -> Text -> Set Text
candidates counter word = detect
  [ known counter $ Set.singleton t
  , known counter (edits1 word)
  , known counter (edits2 word)
  , Set.fromList [t]
  ]

detect :: [Set Text] -> Set Text
detect = fromMaybe Set.empty . head . filter (not . Set.null)

known :: Counter -> Set Text -> Set Text
known counter = Set.filter (\w -> Map.member w counter)
```


## Edits / Permutations

I initially squished all the logic into single list-comprehensions, but you'll see I've split the heavier functions out.

```haskell
edits1 :: Text -> [Text]
edits1 w = nub' $ mconcat [transposes', deletes', replaces', inserts]
  where
    alphabet    = fmap T.singleton ['a'..'z']
    splits      = zip (T.inits w) (T.tails w)
    deletes'    = deletes splits
    transposes' = transposes splits
    replaces'   = replaces splits
    inserts     = [l <> c <> r | (l,r) <- splits, c <- alphabet]
```

The `splits` gets its own type for cleanliness:

```haskell
type Splits = [(Text, Text)]
```

Instead of `if R` or `if len(R)<1` and such like we have in python, I used a `guard` to skip over splits with contents fitting a certain criteria (e.g (l,r) where r is not empty)

```haskell
unSplit :: (Monad f, Alternative f) => (Text, Text) -> f (Text,Text)
unSplit = unSplitWith (/= "")

unSplitWith :: (Monad f, Alternative f) => (Text -> Bool) -> (Text, Text) -> f (Text,Text)
unSplitWith f (l, r) = guard (f r) >> pure (l, r)

-- | swap the 1st and 2nd letters across our list of splits ("derp" -> "edrp")
transposes :: Splits -> [Text]
transposes splits =
  [l <> swap' r | x <- splits, (l,r) <- unSplitWith (\a -> T.length a > 1) x]
  where
    swap' w = T.intercalate "" [two, one', rest]
      where
        two  = T.take 1 $ T.drop 1 w
        one'  = T.take 1 w
        rest = T.tail $ T.tail w

-- | remove a letter across all splits "derp" -> ["drp","dep","der"]
deletes :: Splits -> [Text]
deletes splits =
  [l <> T.tail r | x <- splits, (l,r) <- unSplit x]

-- | try replacing a letter with one from the alphabet in each spot. This one is very large
replaces :: Splits -> [Text]
replaces splits = [l <> c <> T.tail r | x <- splits, (l,r) <- unSplit x, c <- alphabet]
```

I think this comes out reasonably concise.

```haskell
edits2 :: Text -> [Text]
edits2 w = nub' [ e2 | e1 <- edits1 w, e2 <- edits1 e1 ]

-- Prelude's nub is prrrrrretty bad, so we use this instead.
nub' :: [Text] -> [Text]
nub' = Set.toList . Set.fromList
```

## Performance

The performance of the implementation I came to is... really bad. The time taken to guess even short words was ~4 seconds. This was unacceptable considering the python version is nearly instant.

After asking around on irc and slack, two main problems were pointed out. 

- The `words` function was extremely inefficient (thanks to @mwutton for pointing this out)
- The Map and Set in `containers` package are not optimized for this sort of bagging. (thanks to @yaron)

In order to speed up the `words` implementation, we just shove the logic into `Data.Text`'s implementation (which is [nasty](https://hackage.haskell.org/package/text-1.2.2.1/docs/src/Data-Text.html#words)). This buys us ~1 second off the ridiculous 4 seconds.. So, I went further.

Since I wasn't using any order-specific functions on Sets or Maps I just replaced the `containers` dependency with `unordered-containers` and changed the import statements to use them. Bam! This nearly halved the time! But it's still real bad at 1 second.

I used the `profiteur` tool to visualize the performance issues a bit while going through this process, which just basically confirmed that Set/Map operations and `words` were awful, like we already knew.
![profiling](http://i.imgur.com/BkHfS6m.png)

It seems as though python's `Counter` shouldn't be all that different than ours (an unordered hash set) but the haskell version lags behind. I kept the code as intuitive as I knew how and it wasn't quite enough for this type of problem.

## Lessons

1. Always use `unordered-containers` unless you for some reason need to keep the ordering of your data structures.
2. Sometimes pre-processing is worth the effort. You can try as hard as you want to optimize the function, but at some point you have to call it a loss.

I'd welcome any comments about how this could be improved further. The result was not encouraging but despite this, I did learn some things along the way.

The full code is [here](https://github.com/tippenein/spelling-hs)

A literate haskell file to follow along is [here](https://github.com/tippenein/spelling-hs/blob/master/spelling.lhs)


