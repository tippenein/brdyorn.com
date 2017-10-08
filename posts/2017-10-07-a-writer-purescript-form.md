---
layout: post
title: A Purescript Form
tags: [haskell, purescript, forms, boring]
---

What follows is a further look at a portion of [this post](http://www.parsonsmatt.org/2016/01/03/ann_quicklift.html) by @parsonsmatt. WForm, as explained there, is a nice abstraction which is inspired partly by Yesod forms. I found it useful and dropped the implementation in a [repo](https://github.com/tippenein/wform) to work on when I have time (please help).

Right now it's specific to Halogen and bootstrap css, but I don't see any reason it needs to be. In essence it comes down to 2 type aliases and 1 data type. Along with some helper methods for creating fields, you can get a long way with these basics.

There are also further details around the following example in a related [post about codegen](/posts/2017-10-07-the-codegen-hammer.html)

```haskell
type WForm v f a =
  ReaderT
    (Tuple a (FormAction f a))
    (Writer (Array (HTML v (f Unit))))
    a

type FormAction f a = FormInput a -> Unit -> f Unit
data FormInput a
  = Submit
  | Edit (a -> a)
```

This provides a nice, general interface for forms!

Using this abstraction, we can define an `Input` for a component
```haskell
data Input a
  = NewCurator (Form.FormInput CuratorForm) a
```

One thing I like about this is the ease of edit actions using the lens' provided by codegen and the FormInput's `Edit` constructor

For example, you might handle a form edit in your eval loop similar to this:
```haskell
eval (NewCurator ev next) = handleNewCurator ev $> next
  where
    handleNewCurator (Form.Edit f) = do
      H.modify (_form %~ f)
    -- ...
```

We can apply the edit action directly on the form via our lens'. The errors are handled internally to the WForm writer monad.

```haskell
-- we need access to the form from the top level
-- the form itself already has lens' defined (src/App/Form.purs)
_form :: Lens' State CuratorForm
_form = lens _.form _ { form = _}

initialState :: State
initialState = 
  { form: CuratorForm { invitee: "", message: Nothing } }
```

Between WForm and our generated lens' we can compose a form quite cleanly:

```haskell
-- example of a generated field accessor for out form
_message = _Newtype <<< prop (SProxy :: SProxy "message")

render :: State -> H.ComponentHTML Input
render state =
  div_ $ Form.renderForm state.form NewCurator do
    void $ Form.textField "email" "Email" _invitee (Form.nonBlank <=< Form.emailValidator)
    Form.textFieldOpt "message" "A Note" _message  Form.optional
    --                name,      label,  lens,     validations
```

Some context (and all the flaws) of this example can be found [here](https://github.com/tippenein/dusk/blob/master/frontend/src/Component/Admin/Curator.purs)

If you think this could be useful and could provide documentation, examples, or code go [to github](https://github.com/tippenein/wform)
