
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
  , todo = require('./routes/todo')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/imgs/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// page routing
app.get('/', routes.index);
app.get('/contact', routes.contact);
app.post('/contact', routes.post_contact);
app.get('/modesty', routes.modesty);
app.get('/about', routes.about);
app.get('/todo', todo.todo)
app.post('/save', todo.saveTodo)
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
