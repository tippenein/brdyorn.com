/* static pages provider */

function Page(uri, locals){
  this.uri = uri;
  if (uri === '') {
    this.view = 'index.jade';
  } else {
    this.uri = uri;
    this.view = uri + '.jade';
  }
  Page.prototype.render = function(req) {
    // respond to the request with the rendered view
    req.res.render(this.view, {locals: locals})
  }
};

var pages = [];
function page(uri, locals){
  // either passed a dict of locals or a string indicating the title
  if (typeof locals === 'string') {
    pages.push(new Page( uri, {title: locals} ));
  } else {
    pages.push(new Page( uri, locals));
  }
}
page('', 'BrdyOrn.com')
page('contact', 'Contact')
page('about', 'About Brady Ouren')
page('projects', 'Projects - past and present')

function route(app, page) {
  // give it a page instance and the app to route
  app.get('/' + page.URI, function(req) {
    page.render(req)
  });
};

function setup(app) {
  for (page  in pages) {
    route(app, page)
  };
};

//module.exports = { setup, Page }
