/* static pages provider */

function Page(uri, locals){
  this.uri = uri;
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

var pages = [];
function page(uri, locals){
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

function setup(app) {
  for (i in pages) {
    console.log(pages[i])
    route(app, pages[i])
  };
};

/* Static pages*/
page('', 'BrdyOrn.com')
page('contact', 'Contact')
page('about', 'About Brady Ouren')
page('projects', 'Projects - past and present')

exports.setup = setup;
console.log(pages)
