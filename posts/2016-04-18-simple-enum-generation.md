---
layout: post
title: Using Template Haskell to generate an Enum
tags: [enum, th, template-haskell, haskell, meta-programming]
---

### A simple useful case for Template Haskell

``` haskell
{-# LANGUAGE TemplateHaskell #-}

import Language.Haskell.TH

declareAnimals :: [String] -> Q [Dec]
declareAnimals animals =
  return [DataD constraints name vars cons derives]
    where
      constraints = []
      name        = mkName "Animal"
      vars        = []
      cons        = map (\a -> NormalC (mkName a) fields) animals
      fields      = []
      derives     = [''Show, ''Eq, ''Ord, ''Enum, ''Read]
```

``` haskell
animals = ["Aardvark", "Bobcat", "Quokka"]
$(declareAnimals animals)

-- data Signal = Aardvark | Bobcat | Quokka
```

If you only cared about getting an enum type, this is where you can jump off.

### Digging into the types

If we look further at the types involved here, we can learn more about what
this is doing.

At a high level, we're simply building a haskell AST and introducing it into
our code-base.  You can think of this as meta-programming but if you ask me
it's more like playing with legos.

We construct a `data` declaration with `DataD`

``` haskell
DataD :: Cxt -> Name -> [TyVarBndr] -> [Con] -> [Name] -> Dec
```

or if we spread this out and document each piece.

``` haskell
DataD :: Cxt          -- constraints (eg. Num a => a -> a)
      -> Name         -- the type name
      -> [TyVarBndr]  -- type variable bindings
      -> [Con]        -- constructors
      -> [Name]       -- deriving types (eg. Eq, Ord, etc)
      -> Dec
```

simple `Name` constructor

``` haskell
mkName :: String -> Name
```

build a normal Constructor

``` haskell
NormalC :: Name -> [StrictType] -> Con
```

The `derives` need to have the double-tick in order to be read as a syntax builder rather than an actual deriving statement. The same goes for type constraints and such.

You can look at all this documentation on the [Language.Haskell.TH](https://hackage.haskell.org/package/template-haskell-2.10.0.0/docs/Language-Haskell-TH-Syntax.html) page
