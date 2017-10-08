---
layout: post
title: The Codegen Hammer
tags: [purescript, haskell, codegen, bridge, boring]
---

If you must build a Single Page App, it would be nice to avoid some of the work generally required in a separate codebase. Personally, I look for these attributes to justify the overhead:

- Easy to build on - if it takes slightly longer to bootstrap, that's fine.
- Hard to break - interfaces are shared and nearly 1-to-1*
- Remove Redundancy - (more code is more maintenance)

The below is an extended description of the process I talked about at Purescript LA. (slides [here](/slides/bridge-talk.html))

The 2 goals for minimum viability in my mind are:

1. provide correct interfaces for domain-specific queries to build on.
2. ensure handling all responses from the server.

## A Big Hammer

Codegen can be a bit dangerous to wield, but I'll argue here for certain cases where it makes sense and the benefit outweighs the cost.

Anything you are serializing across a network should be considered for codegen. If you're using haskell for your client code, by all means, share your types! For the rest of us using Purescript, we have the fantastic work of [purescript-bridge](https://github.com/eskimor/purescript-bridge). If you happen to be using Servant you could further utilize [servant-purescript](https://github.com/eskimor/servant-purescript). However, my experience was with a Yesod API. Either way, you'll depend on the generic json deriving of Aeson (haskell) and [argonaut's generic codecs](https://github.com/eskimor/purescript-argonaut-generic-codecs/) which are directly compatible with aeson.

## Forms are a subset of your model 

The low-hanging fruit of this approach is form interactions. Your forms will likely be different than your database representations, so this is a nice place to set up types to describe the frontend _input_. Say one of our pages is submitting an email of someone who should be invited to the platform. The database representation might include a token, inviter's id, date invited, etc, but you only need an email and a personal note attached. 

```haskell
data CuratorForm = CuratorForm 
  { email :: EmailAddress
  , message :: Text }
```

This is what the haskell backend expects as a POST so if our form is directly using this type in purescript we can be certain we won't screw up and send the wrong things.

I'll gloss over the form implementation here because it's pretty similar to what's covered in "[Purescript by Example](https://leanpub.com/purescript)" and covered in detail a bit futher [here](/posts/2017-10-07-a-writer-purescript-form.html)

```haskell
initialState = { form: curatorForm }

curatorForm = CuratorForm { email: "", message: Nothing }

render state = do
  -- ...
  div_ $ Form.renderForm state.form NewCurator do
    void $ Form.textField "message" "A Note" _message Form.optional
    Form.textField "email"   "Email"  _email   (Form.nonBlank <=< Form.emailValidator)
```

Something worth noting here is the 3rd arguments to `textField`. These lens' are generated from purescript-bridge (along with Prisms for `CreateResponse`) and they're uses to access and set values in the form where `state.form` is giving us the `CuratorForm` which is also generated from our haskell types. The only thing here that's actually locally defined is the `NewCurator` input event. That's all that should be needed to hook this form into your state.

```haskell
  -- the CuratorForm is the 'form' field of our state.
  response <- post (apiUrl <> "/admin/curators") (encodeJson state.form)
  let Tuple typ msg = handleCreateResponse "admin.curator" response
  return $ flashMessage typ msg
```

We're able to move a lot of code out or generalize it away here because create's are pretty simple. There's another type we're generating called `CreateResponse`. The `handleCreateResponse` function will take care of retrieving the status and a message. (the first argument string is a dumb little i18n translation "index").

```haskell
--  Success, Warning, Failure are for determining the message color..
handleCreateResponse :: TranslationIndex -> Json -> Tuple Message String
handleCreateResponse idx res =
  case decodeJson res.response of
    Left e -> Tuple Failure e
    Right cr -> 
      let msg = Msg.t idx cr -- lookup the message based on the response type
      in
        case cr of
          CreateSuccess _ -> Tuple Success msg
          NotUnique -> Tuple Warning msg
          CreateFailure t -> Tuple Failure msg
```

Here's what it looks like on the haskell side:

```haskell
data CreateResponse
  = CreateSuccess Int64
  | CreateFailure Text
  | NotUnique
  deriving (Generic, Typeable, Show)
```

This can change based on the backend needs and you'll be forced to handle those cases in the frontend. *thumbs up*

## Your Haskell API

The codegen will have to fit somewhere in your build-chain; I put mine in the application settings fetch 

```haskell
getAppSettings :: IO AppSettings
getAppSettings = do
  CodeGen.main 
  loadEnv
  loadYamlSettings [configSettingsYml] [] useEnv
```

This will:

- generate the code in "frontend/src" (Will show where this is specified later)
- populate ENV from a `.env` file
- read the app settings from a yaml and return it

*brent rambo thumbs up gif*

## Gen

The process of defining "bridges" from haskell to purescript is relatively straightforward. One "gotcha" is in that ".purs" files are generated in the same module name as where they're _defined_ in your haskell. Perhaps that's what you expected, but I'd have preferred they get generated into the same file. I'm using a forked version to provide newtype unwrapping and lens for each record field. (PR [here](https://github.com/eskimor/purescript-bridge/pull/31))

This next bit could all be found in the [example](https://github.com/gonimo/gonimo-back/blob/master/app/PSGenerator.hs) or readme of [purescript-bridge](https://www.stackage.org/nightly-2017-10-07/package/purescript-bridge-0.11.0.0), but I'll briefly explain the context for each of these code blocks.

In you CodeGen module you'll need to specify which types are going to be generated in purescript.

```haskell
-- Your list of types to provide
myTypes :: [SumType 'Haskell]
myTypes = [
    mkSumType (Proxy :: Proxy CuratorForm)
  , mkSumType (Proxy :: Proxy EventForm)
  , mkSumType (Proxy :: Proxy CreateResponse)
  -- ...
  ]
```

There will be types you'll need to be specific about; one's without direct purescript primitives. For example, the `Int64` of a primary id database column will need to fall to an `Int` type in purescript:

```haskell
import Language.PureScript.Bridge.PSTypes (psInt)

-- delegate to a primitive
int64Bridge :: BridgePart
int64Bridge = typeName ^== "Int64" >> return psInt
```

This is saying: "Purescript already knows how to handle this but it's called something else"

The other case might involve delegating a type you've defined in purescript. This is not great because you can break your dependent code if you change these. This isn't _bad_ based on how most of the world does frontend development, it's actually exactly how you'd make promises with a javascript app to decode consistently. I think we can do better though.

```haskell
psDateTime :: TypeInfo 'PureScript
psDateTime = TypeInfo {
    _typePackage = ""
  , _typeModule = "Types"
  , _typeName = "DateStamp"
  , _typeParameters = []
  }

utcTimeBridge :: BridgePart
utcTimeBridge = typeName ^== "UTCTime" >> return psDateTime
```

The above example is saying: you'll find a type _named_ `DateStamp` in the purescript _module_ `Types` and it doesn't require an external _package_. Use this when generating fields with type `UTCTime`.

This is about it for the haskell side and you'll write out the types to a file like so:

```haskell
-- defaultBridge, buildBridge, etc are provided by 
-- Language.PureScript.Bridge

main :: IO ()
main = writePSTypes "frontend/src/" (buildBridge mainBridge) myTypes
  where
    mainBridge = defaultBridge <|> int64Bridge <|> utcTimeBridge
```

## Gen-Crafted types for your enjoyment

Below are some examples of the output!

```haskell
-- src/App/Form.purs
derive instance genericCuratorForm :: Generic CuratorForm
derive instance newtypeCuratorForm :: Newtype CuratorForm _

_email = _Newtype <<< prop (SProxy :: SProxy "email")
_message = _Newtype <<< prop (SProxy :: SProxy "message")

-- src/App/Crud.purs
data CreateResponse =
    CreateSuccess Int
  | CreateFailure String
  | FailedUniquenessConstraint 
derive instance genericCreateResponse :: Generic CreateResponse

_CreateSuccess :: Prism' CreateResponse Int
_CreateSuccess = prism' CreateSuccess f
  where
    f (CreateSuccess a) = Just $ a
    f _ = Nothing

_CreateFailure :: Prism' CreateResponse String
_CreateFailure = prism' CreateFailure f
  where
    f (CreateFailure a) = Just $ a
    f _ = Nothing

_FailedUniquenessConstraint :: Prism' CreateResponse Unit
_FailedUniquenessConstraint = prism' (\_ -> FailedUniquenessConstraint) f
  where
    f FailedUniquenessConstraint = Just unit
    f _ = Nothing
```

I've pasted the entirety of both files I'm using to [this gist](https://gist.github.com/tippenein/2e15b695bac673a5acd7a167c2ba4808) and note the naming is slightly different because in _real_ use you'll have to deal with the travesty of haskell record namespaces.


## Next Steps

This is fine and dandy, but it could be much better. Purescript has the tools to [generate forms from data types](https://pursuit.purescript.org/packages/purescript-sparkle/4.1.0) and ideally that's the direction I'd like to move this work.
