{{{
  "title" : "Poet - for your node.js site",
  "tags"  : ["node.js", "express", "poet", "jade", "easy"],
  "category" : "node.js",
  "date" : "1/17/2013",
  "syntax" : "js"
}}}
Since I didn't have time to roll my own blog controller, I'm trying out Poet today.
I'm super pleased with it and I'd suggest it if you want to get up and running with a simple blog.  I'll be writing a blog controller in the next couple weeks because I'd like to know more about the workings of Express.

Basically all you'll need to do is 

    // in app.js
    poet = require('poet')(app)
    
    poet
      .createPostRoute()
      .createPageRoute()
      .createTagRoute()
      .createCategoryRoute()
      .init();

Here is [the documentation](http://jsantell.github.com/poet/)
