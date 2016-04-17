{-# LANGUAGE OverloadedStrings #-}

import Data.List
import Data.Monoid
import Hakyll

contentPage :: String -> Rules ()
contentPage title = do
  route idRoute
  compile $ do
    let indexCtx = constField "title" title <> defaultContext

    getResourceBody
      >>= applyAsTemplate indexCtx
      >>= loadAndApplyTemplate "templates/default.html" indexCtx
      >>= relativizeUrls

listPage title content templateName ctx = do
    route idRoute
    compile $ do
      items <- loadAll $ fromGlob (content ++ "/*")
      let theCtx =
              listField content ctx (return items)
           <> constField "title" title
           <> defaultContext
          theFilePath = fromFilePath ("templates/" ++ templateName ++ ".html")

      makeItem ""
        >>= loadAndApplyTemplate theFilePath theCtx
        >>= loadAndApplyTemplate "templates/default.html" theCtx
        >>= relativizeUrls

main :: IO ()
main = hakyll $ do

  match "resume.pdf" $ do
    route   idRoute
    compile copyFileCompiler

  match "keybase.txt" $ do
    route   idRoute
    compile copyFileCompiler

  match "slides/*" $ do
    route   idRoute
    compile copyFileCompiler

  match "images/*" $ do
    route   idRoute
    compile copyFileCompiler

  match "css/*" $ do
    route   idRoute
    compile compressCssCompiler

  match "posts/*" $ do
    route $ setExtension "html"
    compile $ pandocCompiler
      >>= loadAndApplyTemplate "templates/post.html"    postCtx
      >>= saveSnapshot "content"
      >>= loadAndApplyTemplate "templates/default.html" postCtx
      >>= relativizeUrls

  create ["slides.html"] $ listPage "Slides" "slide" "slides" slideCtx

  create ["archive.html"] $ listPage "Archives" "posts" "archive" postCtx

  match "index.html" $ do
    route idRoute
    compile $ do
      posts <- loadAll "posts/*" >>= fmap (take 10) . recentFirst
      let indexCtx =
              listField "posts" postCtx (return posts)
           <> constField "title" "Home"
           <> defaultContext

      getResourceBody
        >>= applyAsTemplate indexCtx
        >>= loadAndApplyTemplate "templates/default.html" indexCtx
        >>= relativizeUrls

  match "templates/*" $ compile templateCompiler

  -- Render RSS feed
  create ["feed.xml"] $ do
    route idRoute
    compile $
      loadAllSnapshots "posts/*" "content"
        >>= fmap (take 10) . recentFirst
        >>= renderRss feedConfiguration feedCtx

--------------------------------------------------------------------------------
postCtx :: Context String
postCtx = dateField "date" "%b %e, %Y" <> defaultContext

slideCtx :: Context String
slideCtx = defaultContext

feedCtx :: Context String
feedCtx = mconcat
  [ bodyField "description"
  , defaultContext
  ]

feedConfiguration :: FeedConfiguration
feedConfiguration = FeedConfiguration
  { feedTitle       = "Brady Ouren's home page feed."
  , feedDescription = "Brady Ouren's home page feed."
  , feedAuthorName  = "Brady Ouren"
  , feedAuthorEmail = "brdyorn@andand.co"
  , feedRoot        = "http://brdyorn.com"
  }
