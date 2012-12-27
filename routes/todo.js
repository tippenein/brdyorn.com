/*
 * todo list routes
 */

var redis = require('redis'),
    client = redis.createClient();

exports.todo = function(req, res){
  var todos = [];
  client.hgetall('Todo', function(err, objs) {
    for (var k in objs) {
      var newTodo = {
        text: objs[k]
      };
      todos.push(newTodo)
    }
    res.render('todo', 
      { title: 'task list'
      , todos: todos 
    })
  })
}

exports.saveTodo = function(req, res) {
  var newTodo = {};
  newTodo.name = req.body['task'];
  newTodo.id =newTodo.name.replace(' ', '-');
  client.hset("Todo", newTodo.id, newTodo.name);
  res.redirect("back");
}
