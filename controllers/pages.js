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
  console.log(typeof locals)
  if (typeof locals === 'string') {
    pages.push(new Page( uri, 'test' )) //{title: locals} ));
  } else {
    pages.push(new Page( uri, locals));
  }
}
function route(app, page) {
  // give it a page instance and the app to route
  console.log("routing page.uri: " + page.uri + " with title: " + page.locals)
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

module.exports.setup = setup;
console.log(pages)
module.exports.staticPages = pages;
