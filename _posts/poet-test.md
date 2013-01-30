{{{
  "title" : "Poet and node.js",
  "tags"  : ["node.js", "express", "poet", "jade"],
  "category" : "node.js",
  "date" : "1/17/2013",
  "syntax" : "js"
}}}

#### A quick start
Since I didn't have time to roll my own blog controller, I'm trying out Poet today. 
I had some [unrelated problems](http://stackoverflow.com/questions/14409242/tracking-down-a-routing-error-with-node-express) 
with jade views and my negligence in reading the documentation, but overall it was very painless.

Basically all you'll need to do to enable it is a simple `npm install poet -S` to save it in your package.json and in your app.js:
<!--more-->

    poet = require('poet')(app)

    poet
      .createPostRoute()
      .createPageRoute()
      .createTagRoute()
      .createCategoryRoute()
      .init();

#### What does that get you?
This basically sets up your app with the required routes and allows views access to these locals:

- postList
- getPostCount()
- getPost( title )
- getPosts( from, to )
- tagList
- postsWithTag( tag )
- tagUrl( tag )
- categoryList
- postsWithCategory( category )
- categoryUrl( category )
- getPageCount()
- pageUrl( pageNum )  

These are self-explainatory enough that the descriptions probably aren't necessary, but here is [the documentation](http://jsantell.github.com/poet/).  

It's also worth noting that you can equip the `.init()` with any callback, so for example, mine just confirms the posts it is loading.
    
    .init(function(locals) {
      locals.postList.forEach(function ( post ) {
        console.log('loading post: ' + post.url)
      }) 
    }) 

I'd also recommend [this](https://github.com/jsantell/poet/tree/master/examples) if you plan on altering the post/tag/category views and/or routes... which ultimately seems necessary.  
I set up my `blog.jade` with meta content filled via the `tagList` local. You should do this on your `post.jade` as well with the `post.tags` local.

    append metacontent
      meta(content=tagList)

    block content
      title Blog - BrdyOrn.com
      each post in postList
        .blogentry
          h3-
            a(href=post.url) #{post.title}
          //This could obviously be better    
          h6 posted on #{post.date.getMonth()+1}.#{post.date.getDate()}.#{post.date.getFullYear()}
          | <br>
          // need to use ! for indicating no escape
          // since post.content is html
          .blogcontent !{post.content}
          //etc etc

A simple (for)each loop will get you all the posts.

    block nav
      .blog-nav
        .recent.underline Recent Entries-
        ul.blog-preview
          each post in postList
            li 
              a(href=post.url) #{post.title}
        .tags-dropdown.underline Tags
        ul.globaltags.hidden
          each tag in tagList
            .globaltag
              a(href=tagUrl(tag)) #{tag}
      append jsincludes
        script
          $(".tags-dropdown").toggle(function() {
            $(".globaltags").removeClass('hidden')}, function() {
              $(".globaltags").addClass('hidden')
            });

The `jsincludes` block is nice to have for this very reason. I put a silly little dropdown on the taglist div so that big ugly list isn't seen by default.  

#### hint: use [dillinger.io](http://dillinger.io) for writing up your markdown.
