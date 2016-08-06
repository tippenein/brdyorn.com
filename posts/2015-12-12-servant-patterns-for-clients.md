---
layout: post
title: Servant Patterns for Clients
---

Edit: Servant has changed its Client api, but [this](/posts/2016-08-06-upgrading-servant-client-from-zero-four.md) is a post about how to migrate to the new way of deriving clients.

### Clients for Free

The unfortunate reality of many of our day jobs is that we are _not_ able to
replace existing services with haskell. However, don't despair! We can still
write services which consume our existing services quite easily with
[Servant](https://github.com/haskell-servant/servant).

I've picked up some patterns for writing clean haskell code from
[tfausak](https://github.com/tfausak/factory) and they've all come together in
a working user client. 


``` haskell
data User = User {
    id             :: Int
  , email          :: Text
  , first_name     :: Text
  , last_name      :: Text
  , dob            :: Day
  } deriving (Show, Generic, ToJSON, FromJSON)

data UsersResponse = UsersResponse {
  users :: [User]
  } deriving (Show, Generic, FromJSON, ToJSON)

run action = do
  result <- Either.runEitherT action
  case result of
    Left message -> error (show message)
    Right x -> return x

type UserAPI =
       GetUsers
  :<|> GetUser
  :<|> CreateUser
  :<|> UpdateUser
  :<|> DestroyUser


type GetUsers = "user" :> "users"
    :> QueryParam "id" Int
    :> QueryParam "email" Text
    :> Get '[JSON] UsersResponse

type GetUser = "user" :> "users"
    :> Capture "id" Integer
    :> Get '[JSON] User

type CreateUser =  "user" :> "users"
    :> ReqBody '[JSON] User
    :> Post '[JSON] User

type UpdateUser = "user" :> "users"
    :> Capture "id" Integer
    :> ReqBody '[JSON] User
    :> Put '[JSON] User

type DestroyUser = "user" :> "users"
    :> Capture "id" Integer
    :> Delete '[JSON] User

getUsers :<|> getUser :<|> createUser :<|> updateUser :<|> destroyUser =
  client (Proxy :: Proxy UserAPI) (BaseUrl Http "localhost" 5000)

```


With these client functions defined and assuming you have a user service instance running on port 5000
we can test this code out with `stack ghci servant-server servant-client --resolver=lts-3.14`

``` haskell
-- > :load Main.hs

-- to get a specific user
run $ getUser 10001035

-- to query on an attribute
run $ getUsers Nothing (Just "garybusey@example.com")

```

The only thing to add for production-ready status is a header with auth-tokens,
but it really goes to show the ease of generating clients with Servant.
