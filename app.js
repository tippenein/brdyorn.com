
/**
 * Module dependencies.
 */

var express   = require('express')
  , app       = module.exports = express()
  , http      = require('http')
  , db        = require('./db/conn').DbProvider

require('./config')(app, express)

// controllers - load them
controllers = ["pages"]
for (i in controllers) {
  console.log("loading controller: " + controllers[i])
  controller = require('./controllers/' + controllers[i]);
  controller.setup(app)
}
/*
app.get('/', routes.index);
app.get('/contact', routes.contact);
app.get('/projects', routes.projects);
app.post('/save_contact', routes.post_contact);
app.get('/modesty', routes.modesty);
app.get('/about', routes.about);
app.get('/todo', routes.todo)
app.post('/todo', routes.saveTodo)
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
