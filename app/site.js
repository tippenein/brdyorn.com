
/**
 * Module dependencies.
 */

var express   = require('express')
  , app       = module.exports = express()
  , http      = require('http')
  , db        = require('./controllers/db').DbProvider
  , errors    = require('./errors');

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
