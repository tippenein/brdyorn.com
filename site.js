
/**
 * Module dependencies.
 */

var express   = require('express')
  , app       = module.exports = express()
  , http      = require('http')
  , poet      = require('poet')(app)
  //, errors    = require('./errors') 
  , mongoose  = require('mongoose')
  , stylus    = require('stylus')
  //, db        = mongoose.connect('mongodb://localhost/test')

poet
  .createPostRoute()
  .createPageRoute()
  .createTagRoute()
  .createCategoryRoute()
  .init(function(locals) {
    locals.postList.forEach(function ( post ) {
      console.log('loading post: ' + post.url)
    })
  })

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/imgs/favicon.ico'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('AbRsd4gSFffvhy$sfgb5#rs'));
  app.use(express.session());
  app.use(app.router);
  app.use(stylus.middleware({
    src:__dirname + '/public',
    compress:true
  }));
  app.use(express.static(__dirname + '/public'));
});
//Dev settings
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
  app.set('port', process.env.PORT || 8080);
  app.use(express.logger('dev'));
});
//Production settings
app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(function(req,res,next){
    res.status(404);
    res.render('404', {url: req.url, title: '404 - page cannot be found'});
  })
  app.set('port', 80);
});

// controllers - load them
controllers = ["pages", "blog"]
for (i in controllers) {
  console.log("loading controller: " + controllers[i])
  controller = require('./controllers/' + controllers[i]);
  controller.setup(app)
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
