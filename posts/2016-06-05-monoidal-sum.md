---
layout: post
title: Exploring monoids for sum averages
tags: [abelian-groups, monoid, summing, haskell, math, statsd, tdd]
---

In [a talk](https://www.youtube.com/watch?v=cMY1KVrJk0w) by Avi Bryant about
practical systems for Analytics or Aggregation he drew comparisons to Monoids
and Abelian Groups. I thought it would be helpful to work through what he was
explaining with haskell, so here we go.

The first thing discussed is a simple summing with a monoid. We need implementations for:

- mempty: somewhere to start; something that won't affect the outcome of the sum.
- mappend: a way of combining 2 instances together, (we'll use the infix notation or `<>`)
- mconcat: a way of combining a list of instances together down into a single instance (a fold)

The point of this abstraction is to easily allow a fold (reduce) of any data type into itself.
It doesn't _have_ to be commutative, but these monoid instances happen to be. (Abelian groups however, _have_ to be commutative)

### Part 1 - A simple Sum

```haskell
data Collection = Collection { theSum :: Integer }
instance Monoid Collection where
  mempty = Collection 0
  Collection sum1 `mappend` Collection sum2 = Collection (sum1 + sum2)
  mconcat = foldl' mconcat mempty
```

That isn't an astounding monoid instance by any means, but it allows us to do simple summing:

```haskell
mconcat [Collection 1, Collection 10, Collection 20]
-- > Collection {theSum = 31}

-- <> is just an operator equivalent to mappend
Collection 1 <> Collection 2
-- > Collection { theSum = 3 }
```

### Part 2 - A simple Averaging aggregation

The next step is to average the sum as we go.

```haskell
data Collection = Collection 
  { theSum :: Integer
  , avg :: Maybe Double }
```

What we'd expect with this is `Collection 1 1 <> Collection 10 10` to equal
`Collection {sum = 11, avg = 5.5 }`

Later on we might want to subtract a Collection from this aggregation or weight
the averages. These scenarios can be handled by storing a `count` of
`Collections` seen so far. Ideally we would have an implicit count instead of a
repetitive explicit argument, but for now let's just add count to the data type
and write a quickcheck property for counting:

```haskell
-- btw, the data type now looks like:
-- { theSum :: Integer, count :: Integer, avg :: Maybe Double }
it "counts consistently" $ property $ \n ->
  count (mconcat $ replicate n justOnes) `shouldEqual` n
```

QuickCheck will tell us one error that we probably didn't consider: What if the count
is negative? We shouldn't allow that, but for now we're just going to take the
absolute value of what quickcheck inputs and test all the positive values of `count`.

```haskell
count (mconcat $ replicate (abs n) justOnes) `shouldBe` abs n
```

(I'm fighting the urge to tangent on QuickCheck, but I promise to tackle it in a different post)

Now for the instance definition of our new averaging sum-thingy! I'll skip over
the more trivial parts, but the example repo will be available for a complete
look [here](https://github.com/tippenein/commutative-monoid-example)

```haskell

-- The only thing changing here is the mappend definition
instance Monoid Collection where
  mempty = Collection 0 0 Nothing
  -- The cases where average is Nothing are omitted
  (Collection s1 c1 (Just avg1)) `mappend` (Collection s2 c2 (Just avg2)) =
    Collection (s1 + s2) (c1 + c2) average
    where
      average = Just $
        ((avg1 * fromInteger c1) + (avg2 * fromInteger c2))
          / (fromInteger c1 + fromInteger c2)
  mconcat = foldl' mconcat mempty
```

You might say "That's just some grade-school weighted average stuff.. childs play!", and you'd be right!

### Part 3 - The beauty of this abstraction

Ok, the weighted average is fine.. but what if we also wanted a top 10 aggregation.
It turns out we still only need to change a few things to get this aggregation to work.

We might as well drive the implementation with specs since the intention is well defined.

```haskell
-- I usually write the intended data type first then use that interface to build specs.
-- so here's our new fields for the CollectionTops data type
-- { aSum :: Integer, tops :: [Integer] }

topsCollection1 = CollectionTops 1 (reverse [1..10])

it "collects the top10" $
  topsCollection1 <> mempty `shouldBe` topsCollection1

it "collects the top10" $ do
  let cs = topsCollection1 <> CollectionTops 3000 negativeInfinities
  head (tops cs) `shouldBe` 3000
  (1 `elem` tops cs) `shouldBe` False -- it knocks 1 out of the list
```

```haskell
negativeInfinities = replicate 10 (-1)
revSort = sortBy (flip compare)

instance Monoid CollectionTops where
  mempty = CollectionTops 0 negativeInfinities
  CollectionTops s1 tops1 `mappend` CollectionTops s2 tops2 =
    CollectionTops {
      aSum = s1 + s2
    , tops = take 10 $ revSort ([s1] ++ [s2] ++ tops1 ++ tops2) }
  mconcat = foldl' mappend mempty
```

### Part 4 - Sum up (pun intended)

In his talk, Avi obviously goes further than this, however, this post is already becoming
too long. Other uses hinted at include
[skewness](https://en.wikipedia.org/wiki/Skewness),
[kurtosis](https://en.wikipedia.org/wiki/Kurtosis), histograms, and unique
visitors. The above implementations are intended to give an intuition about
commutative monoids as a tool for aggregation.

To sum up...

- we need 3 functions for a monoid instance: mempty, mappend, and
  mconcat. 
- If you can define mappend, the other 2 should be easy (I've noticed
  that mconcat is mostly just used to provide a faster implementation of the
  standard `foldr mappend mempty`). 
- The monoid laws ensure associativity, but we have to be explicit about our commutative intentions.

I hope this calms your nerves about monoids and perhaps provides a bit of
intuition about what _is_ or _could be_ a monoid.
