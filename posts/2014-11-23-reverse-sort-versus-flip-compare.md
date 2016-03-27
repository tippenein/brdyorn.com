---
layout: post
title: Comparing reverse sort and flip compare
---

### Comparing flip compare

GHCmod-vim hinted at an improvement in some code I was writing:

`reverse $ sort` why not `sortBy (flip compare)`

So I looked at the type signatures for each of these.

    λ > :t reverse $ sort
    λ > Ord a => [a] -> [a]

    λ > :t sortBy
    λ > (a -> a -> Ordering) -> [a] -> [a]

    λ > :t (flip compare)
    λ > Ord b => b -> b -> Ordering

`flip` is just `f x y = f y x`

A little reminder of how `compare` works:

    λ > compare 1 2
    λ > LT
    λ > flip compare 1 2
    λ > GT

This is the part that wasn’t obvious to me; that by simply flipping the
comparison we’re reversing the resulting sorted list.
At that point we can see that `sortBy` is traversing the list once whereas
`reverse $ sort` is running through the list twice.

