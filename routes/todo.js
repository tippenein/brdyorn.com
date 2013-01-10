/*
 * todo list routes
 */

function appendTodo(todo) {
  db.open(function(err,db) {
    db.collection('todo', function(err, collection) {
      collection.insert({todo:todo}, function(err, docs) {
        console.log(docs);
        db.close();
      })
    })
  })
}

exports.todo = function(req, res){
  // get tasks from file and render
  var todos = [];
  console.log("todos:" + todos)
  db.open(function(err, db) {
    db.collection('todo', function(err, collection) {
      console.log(collection)
    })
  })
  res.render('todo', 
    { title: 'task list'
    , todos: todos 
    });
}

exports.saveTodo = function(req, res) {
  // POST todo
  // write new task to file
  var newTodo = {};
  newTodo = req.body['task'];
  appendTodo(newTodo)
  res.redirect("back");
}
