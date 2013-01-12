/* 
 * static page routes go here 
 */

exports.index = function(req, res){
  console.log(module)
  res.render('index', { title: 'BrdyOrn', status:'' });
};

exports.contact = function(req, res){
  res.render('contact', { title: 'Contact Brady Ouren', status:''});
};
exports.about = function(req, res){
  res.render('about', { title: 'About Brady Ouren', status:''});
};
exports.projects= function(req, res){
  res.render('projects', { title: 'Projects', status: ''});
};

exports.post_contact = function(req, res){
  name = req.body.name || 'Anonymous';
  email = req.body.email || 'None';
  message = req.body.message;
  console.log(name + " - " + email + " said: \n" + message);
  db.open(function(err, db){
    db.collection('test', function(err, collection){
      console.log('collection: ' + collection)
      db.close()
    })
  })
  // send message to db 
  res.render('index', {title: '', type: 'success', status: 'Thanks for the comments'})
};

exports.modesty = function(req, res){
  res.render('modesty', { title: "Mode-sty"});
};


exports.todo = function(req, res){
  var todos = [];
  res.render('todo', 
    { title: 'task list'
    , todos: todos 
    });
}

exports.saveTodo = function(req, res) {
  var newTodo = {};
  newTodo = req.body['task'];
  console.log('new todo: ' + newTodo)
    db.open(function(err,db) {
      db.collection('test', function(err, collection) {
        console.log(collection);
        db.close();
      })
    })
  //appendTodo(newTodo)
  res.redirect("back");
}

/*
function appendDb(item, todo) {
  db.open(function(err,db) {
    db.collection('todo', function(err, collection) {
      collection.insert(item, function(err, docs) {
        console.log(docs);
        db.close();
      })
    })
  })
}
*/
