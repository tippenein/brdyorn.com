---
layout: post
title: Writing a simple cli with Wreq
tags: [wreq, haskell, imgur, cli, fp, functional]
---

### Starter project

I remember when I started programming in python. I looked for anything I could
write as a CLI or automate in some way, so in the spirit of that, I decided to
write a bit about doing the same using haskell libraries. 

I replaced monosnap functionality (sharing screenshots) with this script awhile
back. It's generically useful and
[here is the whole of it](https://github.com/tippenein/imgup/blob/master/lib/Imgup.hs)
if you're only interested in the source.

Also, there's a deeper dive into Wreq
[here](http://www.serpentine.com/wreq/tutorial.html) if you find this cursory
intro lacking

### Bam! Some code

The important imports:

```haskell
import Data.Monoid ((<>)) -- just for glueing together Text's
import Network.Wreq       -- the request library
import Control.Lens       -- setting and getting params/headers/etc
import Data.Aeson.Lens    -- same
```

Since the main thing this script does is upload a photo anonymously to imgur,
we'll start with that function.

### The Request

```haskell
uploadAndReturnUrl :: IO String
uploadAndReturnUrl = do
  imagePath <- parseArgs
  cid <- clientId
  let authHeader = defaults & header "Authorization" .~ ["Client-ID" <> " " <> cid]
  let payload = [ partText "type" "file"
                , partFile "image" imagePath
                ]
                                  
  res <- postWith authHeader "https://api.imgur.com/3/image.json" payload
  let guid = res ^. responseBody . key "data" . key "id" . _String
  return $ "http://imgur.com/" ++ T.unpack guid
```

Let's talk about what might be confusing here. The declaration of `authHeader`;
what is that?

```haskell
-- in this context, simply a merge 
(&) :: a -> (a -> b) -> b

-- build the header to combine with the defaults :: Options
header :: HeaderName -> ([ByteString] -> f [ByteString]) -> Options -> Options
```

If you wanted to, you could think of this as an equivalent to the ruby code:

```ruby
defaults = {:params => [], :headers => []}
defaults[:headers].merge({ :Authorization => "Client-ID #{cid}" })
```

Fortunately, our code using Lens' is much more fail-safe. (you could read more
[here](http://lens.github.io/tutorial.html) or one of the plethora of other
lens tutorials online)

The actual post is pretty self explanatory if you know what `authHeader` and
`payload` are, but here's the type sig anyway:

```haskell
postWith :: Postable a => Options -> String -> a -> IO (Response ByteString)
```

The `Postable` typeclass refers to our `[Part]` which we
constructed in the payload declaration, nbd.

### The Response

```haskell
res ^. responseBody . key "data" . key "id" . _String
```

We use `^.` to pull out the image id returned from imgur. Unfortunately, lens'
compose left to right, unlike normal functions in haskell so this is `responseBody.data.id`

The equivalent ruby code might be something like:

```ruby
response.body[:data][:id]
```

Again, ours is a bit safer.

### Wrap Up

There's one other piece which grabs the most recent screenshot.

```haskell
getRecentPath :: IO FilePath
getRecentPath = do
  home <- getHomeDirectory
  d <- return (joinPath [home, "Desktop"])
  files <- globDir1 (compile "Screen Shot*") d
  case headMaybe (reverse (sort files)) of 
    Nothing -> error "no recent screenshots"
    Just a -> return a
```

This could be improved by returning an `Either String FilePath` instead of
raising an error, but if we stopped and optimized every chance we had in haskell
we'd never finish writing what we started.

At the end of all this, we can screen cap and pop over to a terminal:

```shell
imgup --screenshot | pbcopy
```

Now we have an imgur link in our copy buffer which (for me) completely replaces monosnap's functionality.
