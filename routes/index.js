
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'BrdyOrn' });
};


exports.contact = function(req, res){
  res.render('contact', { title: 'Contact Brady Ouren'});
};
exports.about = function(req, res){
  res.render('about', { title: 'About Brady Ouren'});
};

exports.post_contact = function(req, res){
  name = req.body.name || 'Anonymous';
  email = req.body.email;
  message = req.body.message;
  
  req.session.name = name;
  req.session.email = email;
  req.session.message = message;
  console.log(name + " - " + email + " said: " + message);
  res.redirect('/');
};
