/* static pages provider */

var formidable = require('formidable')

var pages = [];

function Page(uri, locals){
  this.uri    = uri;
  this.locals = locals;
  
  if (uri === '') {
    this.view = 'index.jade';
  } else {
    this.view = uri + '.jade';
  }
  Page.prototype.render = function(req) {
    // respond to the request with the rendered view
    req.res.render(this.view, this.locals)
  }
};

function page(uri, locals, type){
  // either passed a dict of locals or a string indicating the title
  if (typeof locals === 'string') {
    pages.push(new Page( uri, {title:locals, status:''})) 
  } else {
    pages.push(new Page( uri, locals));
  }
}

function route(app, page) {
  // give it a page instance and the app to route
  app.get('/' + page.uri, function(req) {
    page.render(req)
  });
};

/* Static pages*/
page('', 'BrdyOrn.com')
page('contact', 'Contact')
page('about', 'About Brady Ouren')
page('projects', 'Projects - past and present')
page('photo_upload', 'Upload your Photo Publicly')
page('photo_show', 'Uploaded Photo')

exports.setup = function(app) {
  /*setup static pages*/
  for (i in pages) {
    console.log(pages[i].locals)
    route(app, pages[i])
  };

  /*other pages go here*/
  app.post('/save_contact', function(req, res){
    name = req.body.name || 'Anonymous';
    email = req.body.email || 'None';
    message = req.body.message;
    console.log(name + " - " + email + " said: \n" + message);
    // send message to db 
    res.render('index', {title: '', type: 'success', status: 'Thanks for the comments'})
  });
  
  app.post('/photo_post', function(req, res){
    var form = new formidable.IncomingForm
    form.uploadDir = __dirname + '/public/imgs/'
    form.parse(req, function(err, fields, files){
      if (err) {
        console.log('error happened')
        next(err);
      } else {
        console.log('\nuploaded %s to %s'
          , files.image.filename
          , files.image.path);
        res.render('photo_show', {title:'', type: 'success', status:'Enjoy your photo until someone else uploads one'})
      }
    }); 
  });

  app.get('/todo', function(req, res){
    var todos = [];
    res.render('todo', 
      { title: 'task list'
      , todos: todos 
      });
  });
  
  app.post('save_todo', function(req, res) {
    var newTodo = {};
    newTodo = req.body.task;
    console.log('new todo: ' + newTodo)
    res.redirect("back");
  });
};
