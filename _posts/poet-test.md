{{{
  "title" : "Poet - for your node.js site",
  "tags"  : ["node.js", "express", "poet", "jade", "easy"],
  "category" : "node.js",
  "date" : "1/17/2013",
  "syntax" : "js"
}}}
Since I didn't have time to roll my own blog controller, I'm trying out Poet today.  I had some [unrelated problems](http://stackoverflow.com/questions/14409242/tracking-down-a-routing-error-with-node-express) with jade views and my negligence in reading the documentation, but overall it was very painless.

Basically all you'll need to do to enable it is a simple `npm install poet -S` to save it in your package.json and in your app.js:

    poet = require('poet')(app)
    
    poet
      .createPostRoute()
      .createPageRoute()
      .createTagRoute()
      .createCategoryRoute()
      .init();

Here is [the documentation](http://jsantell.github.com/poet/), but I'd also recommend [this](https://github.com/jsantell/poet/tree/master/examples) if you plan on altering the post/tag/category views and/or routes.
Which ultimately seems necessary.
