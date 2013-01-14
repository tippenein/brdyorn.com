/* 
 * unused at the moment. replaced by pages controller
 * some of these pages will be need a new controller
 */

exports.post_contact = function(req, res){
  name = req.body.name || 'Anonymous';
  email = req.body.email || 'None';
  message = req.body.message;
  console.log(name + " - " + email + " said: \n" + message);
  // send message to db 
  res.render('index', {title: '', type: 'success', status: 'Thanks for the comments'})
},

exports.todo = function(req, res){
  var todos = [];
  res.render('todo', 
    { title: 'task list'
    , todos: todos 
    });
},

exports.saveTodo = function(req, res) {
  var newTodo = {};
  newTodo = req.body['task'];
  console.log('new todo: ' + newTodo)
  res.redirect("back");
}
