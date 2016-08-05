---
layout: post
title: A Typed Fullstack With Elm & Haskell
tags: [Elm, haskell, typed-wire, fullstack, compiler-driven, api]
---

### Hard Choices

Everytime you make a design decision about a system, you have to (or should) consider
the possible maintenance implications. Personally, I think typed languages make
this much more manageable. We'll use Haskell and Elm to illustrate this case via
a project called [hasken](https://github.com/tippenein/hasken). 

This started as a simple CLI communicating with an API, but as is so common, we
now want a frontend to display the resources on the web.

### What we want

We want a few reasonable things:

1. Our entities should be synchronized between the frontend and backend.
2. Changes won't break any existing functionality.
3. No way of leaving out edge cases

### Synchronizing changes between Api and Frontend

When we have a change or addition to the representation of data, we'll have to
change both back- and frontend. There are a few possible solutions, but I've
chosen to use [typed-wire](https://github.com/typed-wire/typed-wire) which
provides us with an intermediate language to define the common entities in.

```
type Document{
  id : Int;
  title : String;
  content : String;
  tags : List<String>;
}
```

When we've defined our entity, we can generate the code we need to produce and
consume this data. 

```
twirec -e Document -i . --elm-out src/Gen --elm-version 0.17
```

At the moment of this writing, typed wire can also generate a Spock
api and json encodings, however, _hasken_ already has a solid
[servant](http://haskell-servant.readthedocs.io/en/stable/) api defined, so
we'll be discussing how to use the generated elm bindings to have type-safe
communication between them.

Note: The Servant side of things will be discussed in a separate post, but the
same design principles and ensuing safety will be the same as we'll see with Elm
soon.

### Maintainability

Instead of writing a whole lot of tests (which also need maintenance) to ensure
the proper manipulation of data between components, let's encode this
information in the types. This way, we'll know how to fix something before we
even write specs. 

_PSA: To be clear, I'm not saying "don't write tests"; I'm saying "We can get away with far fewer!"_

When you make changes to an Api, you should feel comfortable updating the frontend to match those changes.

We can use type inference to forego specifying types while we prototype in
_both_ languages and still get the benefit of compiler aided debugging.

As an example of using a compiler to guide feature implementation, let's look at actions in Hasken's interface:

```elm
type Action
  = FetchDocuments
  | ErrorOccurred String
  | DocumentsFetched (List Document)
```

This encodes every possible state our app can be in. This is *huge*! The
compiler will force us to deal with every case.

Our `model` holds the data which we're trying to represent.

```elm
model : Model
model =
  { documents = Right []
  , queryString = ""
  }
```

At this point you might be thinking.. Isn't this just redux? Yes! Reactive
Programming is just a way of thinking about data flows. That fact isn't as
important as the way we can develop programs in Elm though.

### An Example: Adding Search

The ease of developing this interface shows with an example of adding a feature. Let's add search.

First we add an Action union-type `Search String` which just means there is an
action which supplies a string and represents "searching". That's all we know at
the moment, but we want our app to represent this in some way. Now we look to the compiler.

It tells us that our `update` function doesn't handle the `Search` action case.. So we must write it!

Our current update looks something like this:

```elm
update : Action -> Model -> (Model, Cmd Action)
update action model =
  case action of
    FetchDocuments ->
      model ! [fetchDocuments]
    ErrorOccurred errorMessage ->
      { model | documents = Left("Oops! An error occurred: " ++ errorMessage) } ! []
    DocumentsFetched documents ->
      { model | documents = Right(documents) } ! []

-- Syntax tip: `model ! [fetchDocuments]` is syntactic sugar for `(model, fetchDocuments)`
-- Type tip: `Right` and `Left` are encoding success and failure. This is called the `Either` type.

```

This method returns an updated model with some possible `Cmd Action`. If we're
going to fix the compilation error, we need to pattern match `Search term` and
tell it how to react.

```elm
Search term -> model ! [searchDocs term]
```

Now we define the function to fetch documents:

```elm
getDocs : Maybe (List (String, String)) -> Cmd Action
getDocs mquery_params =
    let url = Http.url docUrl (fromMaybe [] q)
        docUrl = baseUrl ++ "/documents"
    in
      Http.get (Json.list jdecDocument) url
        |> Task.mapError toString
        |> Task.perform ErrorOccurred DocumentsFetched
```

1. our chaining of tasks `|> ... |> ...` deals with encoding the result of the http requests into our action types (`ErrorOccured` & `DocumentsFetched`)
2. `jdecDocument` is the json decoder that was defined in our typed-wire-generated module; we expect a list of those.
3. query params might be empty, so we deal with that case via a `Maybe` and our `fromMaybe` defaults to `[]` if none are passed.

### The view

The next compiler error will tell us that we don't have an interface component to _trigger_ the `Search` action.
We'll be able to succinctly express this in our interface via the `view` function.

```elm
view : Model -> Html Action
view model =
  div []
    [
      statusMessage model.documents
    , searchBox model Search  --- a function to generate markdown for a search box
    , documentList model.documents
    ]
```

From a high level, this is a very useful abstraction. We can modularize our view
"partials" as we see fit and it helps us think about the best way to organize
our components.

Now it will compile! We've successfully added a feature that we know works.

### What next?

In the follow up we'll talk about deploying all this in a sane way, but for now we can plan out the build steps.

I've just used a `Makefile` for now and it looks like:

```
all:
    gen
    build
    js

gen:
	twirec -e Document -i . --elm-out src/Gen --elm-version 0.17

build:
	elm package install

js:
	elm make src/Main.elm --output=elm.js

```

After running this, we'll have the json encoding module (in `src/Gen/`) along with a compiled elm.js which we can simply attach to an html node in our index:

```html
<script src="./elm.js" type="text/javascript"></script>
<script>
    var node = document.getElementById('content');
    var app = Elm.Main.embed(node);
</script>
```

Since these steps won't work on your machine unless you gather all the
dependencies (typed-wire, ghc, elm, etc.), in the next step we'll put this all
in a docker container and show how to deploy it using whichever docker service
you'd like.
