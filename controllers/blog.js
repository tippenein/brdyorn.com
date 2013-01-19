/* poet blog routing*/

exports.setup = function(app) {
  app.get( '/post/:post', function ( req, res ) {
    var post = req.poet.getPost( req.params.post );
    if ( post ) {
      console.log(post)
      res.render( 'post', { post: post }); 
    } else {
      console.log(post)
      res.send(404);
    }
  });

  app.get( '/tag/:tag', function ( req, res ) {
    var taggedPosts = req.poet.postsWithTag( req.params.tag );
    if ( taggedPosts.length ) {
      res.render( 'tag', {
        posts : taggedPosts,
        tag : req.params.tag
      });
    }
  });

  app.get( '/category/:category', function ( req, res ) {
    var categorizedPosts = req.poet.postsWithCategory( req.params.category );
    if ( categorizedPosts.length ) {
      res.render( 'category', {
        posts : categorizedPosts,
        category : req.params.category
      });
    }
  });

  app.get( '/page/:page', function ( req, res ) {
    var page = req.params.page
      , lastPost = page * 3
    res.render( 'page', {
      posts : req.poet.getPosts( lastPost - 3, lastPost ),
      page : page
    });
  });
};

