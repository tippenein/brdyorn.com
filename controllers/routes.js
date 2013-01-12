/* 
 * unused at the moment. replaced by pages controller
 * some of these pages will be need a new controller
 */

module.exports = function( db ){
  return {
    index: function(req, res){
      res.render('index', { title: 'BrdyOrn', status:'' });
    },
    contact: function(req, res){
      res.render('contact', { title: 'Contact Brady Ouren', status:''});
    },
    about: function(req, res){
      res.render('about', { title: 'About Brady Ouren', status:''});
    },
    projects: function(req, res){
      res.render('projects', { title: 'Projects', status: ''});
    },

    post_contact: function(req, res){
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
    },

    todo: function(req, res){
      var todos = [];
      res.render('todo', 
        { title: 'task list'
        , todos: todos 
        });
    },

    saveTodo: function(req, res) {
      var newTodo = {};
      newTodo = req.body['task'];
      console.log('new todo: ' + newTodo)
      db.open(function(err,db) {
        db.collection('test', function(err, collection) {
          console.log(collection);
          db.close();
        })
      })
      res.redirect("back");
    },

  } //end return
}

