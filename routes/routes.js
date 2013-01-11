/* 
 * static page routes go here 
 */

exports.index = function(req, res){
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
  // send message to db 
  res.render('index', {title: '', type: 'success', status: 'Thanks for the comments'})
};

exports.modesty = function(req, res){
  res.render('modesty', { title: "Mode-sty"});
};

