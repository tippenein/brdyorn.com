
/**
 * Module dependencies.
 */

var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , db      = require('./db/db.js')
  /* routes */
  , routes  = require('./routes/routes')
  , todo    = require('./routes/todo')
  , user    = require('./routes/user')
  /* db */
  , mongo = require('mongodb')
  , host = 'localhost'
  , port = mongo.Connection.DEFAULT_PORT
  , db = new mongo.Db('brdyorn', new mongo.Server(host, port, {}), {})

exports.db = db

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/imgs/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('AbRsd4gSFffvhy$sfgb5#rs'));
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
app.post('/save_contact', routes.post_contact);
app.get('/modesty', routes.modesty);
app.get('/about', routes.about);
app.get('/todo', todo.todo)
app.post('/todo', todo.saveTodo)
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
