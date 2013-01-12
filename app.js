
/**
 * Module dependencies.
 */

var express = require('express')
  , app     = module.exports = express()
  , http    = require('http')
  /* routes */
  , routes  = require('./routes/routes')
  
  /*db*/
  , mongoose = require('mongoose')


require('./config')(app, express)
require('./db/conn')(mongoose)

// page routing
app.get('/', routes.index);
app.get('/contact', routes.contact);
app.get('/projects', routes.projects);
app.post('/save_contact', routes.post_contact);
app.get('/modesty', routes.modesty);
app.get('/about', routes.about);
app.get('/todo', routes.todo)
app.post('/todo', routes.saveTodo)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
