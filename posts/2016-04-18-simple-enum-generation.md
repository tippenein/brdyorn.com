---
layout: post
title: Using Template Haskell to generate an Enum
tags: [th, template-haskell, haskell, meta-programming]
---

### A simple useful case for Template Haskell

``` haskell
{-# LANGUAGE TemplateHaskell #-}

module SomeEnum where

import Language.Haskell.TH

declareAnimals :: [String] -> Q [Dec]
declareAnimals animals = return [DataD context name vars cons derives] where
  context  = []
  name     = mkName "Animal"
  vars     = []
  cons     = map (\a -> NormalC (mkName a) []) animals
  fields   = []
  derives  = [''Show, ''Eq, ''Ord, ''Enum, ''Read]
```

``` haskell
animals = ["Aardvark", "Bobcat", "Quokka"]
$(declareAnimals animals)

-- data Signal = Aardvark | Bobcat | Quokka
```

If you only cared about getting an enum type, this is where you can leave.

### Digging into the types

If we look further at the types involved here, we can learn more about what
this is doing.

``` haskell
DataD :: Cxt -> Name -> [TyVarBndr] -> [Con] -> [Name] -> Dec

mkName :: String -> Name

NormalC :: Name -> [StrictType] -> Con
```
