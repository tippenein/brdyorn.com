
/**
 * Module dependencies.
 */

var express   = require('express')
  , app       = module.exports = express()
  , http      = require('http')
  , poet      = require('poet')(app)
  , errors    = require('./errors') 
  , mongoose  = require('mongoose')
  //, db        = mongoose.connect('mongodb://localhost/test')

poet
  .createPostRoute()
  .createPageRoute()
  .createTagRoute()
  .createCategoryRoute()
  .init() // takes a callback if need to run anything on startupPageRoute()
require('../config')(app, express)

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
