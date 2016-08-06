---
layout: post
title: Upgrading Servant Clients
tags: [servant, haskell, client]
---

A few things have changed with Servant's client deriving between `0.4` and `0.7`. I'll document here what I did to upgrade.

### Follow the types

First thing you'll notice after building your project with the 0.7 version of
servant client is some failing functions. Let's follow the types and do what
they tell us.

The first error is that BaseUrl takes an extra "path" argument. It's just a string; ghc tells us this.

```haskell
makeBaseUrl = do
  h <- Config.domain <$> Config.remoteConfig
  p <- Config.port <$> Config.remoteConfig
  -- BaseUrl has 1 extra argument
  -- used to be: pure $ BaseUrl Http h p
  pure $ BaseUrl Http h p ""
```

Now we use ExceptT instead of EitherT. It's better, and ghc tells us that's what it's expecting.

```haskell
type Action a = ExceptT ServantError IO a
```

This type alias has existed as `ClientM` and `Handler` (see
[this](https://github.com/haskell-servant/servant/issues/467) and
[this](https://github.com/haskell-servant/servant/issues/434)) but I prefer to
write this explicitly and forego all the changes that might happen in servant.

The next compiler error says something about an expected Manager argument to
one of our bound client functions.

### Http manager

There is a new dependency on http-client. Luckily I had structured my code to
use this generic `run` function, so I only had to make manager updates here.

```haskell
run action = do
  baseUrl <- makeBaseUrl
  manager <- newManager defaultManagerSettings
  result <- runExceptT $ action manager baseUrl
  case result of
    Left message -> error (show message)
    Right x -> pure x
```

Essentially we only needed to pass 2 new arguments to the action (the derived
functions from `client`) and run them inside `runExceptT`.

The last compiler error you'll get is an extra argument to `client` which is
just a remnant you can delete. It was previously the BaseUrl argument, but
we've already moved that to the `run` function.

```haskell
listDocuments' :<|> createDocument' =
  -- we no longer pass the url into the `client` deriving function.
  client documentAPI
```

That's pretty much it. I didn't really have to look anything up. The compiler
didn't _directly_ tell me how to fix it, but it _did_ tell me which parts of my
code had strange arguments, which were then easy to correct.

Matter of fact, the commit where I recently did this is
[here](https://github.com/tippenein/hasken/commit/c3cb78197f0b470f944789a3b0552a42fd369aca#diff-1d9ebc04df2ac4beb0ee8681f4f13c4cR23)
if that's your sort of thing.

