---
layout: post
title: Partial Application for real
tags: [haskell, functional-programming]
---

### Intuitive Solutions

While working on [a library](http://github.com/tippenein/BankHoliday) recently, I came across an elegant use of partial application.

How would we model the first monday in any given month. Firstly I needed a
way of passing around the concept of a `month` which ends up being simply
`fromGregorian` applied to a year and month index.

The type signature being: `fromGregorian :: Integer -> Int -> Int -> Day`

So, a month, when partially applied, becomes a function taking an `Int` and
returning a `Day` which is exactly what we want.

A common scenario for a bank holiday library is "first monday in *month*" and
with our ability to pass in "months" to a function we define it this way:

{% highlight haskell %}
[jan, feb, mar] = map (fromGregorian 1999) [1,2,3]

firstMondayIn month = addDays offset (month 07)
  where
    offset = negate (weekIndex (month 02))

weekIndex day = toModifiedJulianDay day `mod` 7
{% endhighlight %}

The most difficult part here was figuring out how Julian time worked, but the
solution ends up being super readable.

The other scenario for describing US bank holidays is the case where a holiday
falls on a weekend.

{% highlight haskell %}
january_holidays = [weekendHolidayFrom (jan 1), weekendHolidayFrom (jan 20)]

weekendHolidayFrom :: Day -> Maybe Day
weekendHolidayFrom d = case weekIndex d of
  3 -> Nothing            -- saturday
  4 -> Just (addDays 1 d) -- sunday
  _ -> Just d
{% endhighlight %}

From here, we have a list of `Maybe Day`'s so we need to filter them down to
`Day`s. There's probably a better way of doing this, but I used `mapMaybe`
because of the type: `(a -> Maybe b) -> [a] -> [b]`

{% highlight haskell %}
mapMaybe id january_holidays
{% endhighlight %}

### The subtle benefit

There is plenty said about the benefits of partial application or the lack
thereof, but this isn't really about that. It's about the ease of prototyping
this sort of solution. From what I can tell, the equivalent ruby solution would
not have been as clean, _because_ of the lack of first class partial
application.

I'm also amused by this application because most other cases I read have
seemingly contrived examples whereas this seems natural to me

