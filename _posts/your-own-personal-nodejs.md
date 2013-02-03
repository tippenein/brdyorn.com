{{{
    "title" : "Building a Personal Node.js Website"
  , "tags" : ["node.js", "express", "jade", "stylus"]
  , "category" : "node.js"
  , "date" : "1/19/2013"
  }}}


#### Motivation for a personal site running node.js
I went into this project out of curiosity knowing very little about javascript much less node.
My experience was almost entirely in python web frameworks (see [Flask](http://flask.pocoo.org/) and [Django](https://www.djangoproject.com/))
but they're all pretty similar. This will be a chronicle of the adventure that leads to this post.

<!--more-->

#### Depends on the use case
I had a [frantech](http://buyvm.net) 512 vps that I wasn't using to its full potential so I've basically converted it into the sole machine hosting this site. I use under 1% of the memory
so if you're planning on hosting a small application or personal site, I'd recommend downgrading to 256. The only other services I know have been good for people are [nodejitsu](http://nodejitsu.com/)
which is free or very cheap, depending on your needs and [Heroku](http://www.heroku.com/). For me, I was using the vps as a persistent irssi connection, so it was serving 2 purposes 
(irssi uses so few resources you won't even know it's running).

#### A collection of resources
I'll just list a few of the articles and books I read to get going but this is the easiest part because node tutorials are all over the place

- [Javascript - The Good Parts](http://www.amazon.com/JavaScript-Good-Parts -Douglas-Crockford/dp/0596517742) and ["Node up and running"](http://www.amazon.com/Node-Running-Scalable-Server-Side-JavaScript/dp/1449398588)
    Douglas  Crockford's book is the most useful of the 2 but "Node up and  running" is a fine overview of what you can expect with an express application

- [AdequatelyGood.com](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth) article on javascript module patterns  which in my opinion is necessary knowledge for routes in an express application.  You'll be fine without knowing exactly what you're doing, but the background really helps.

- Peter Lyons' [answer](http://stackoverflow.com/questions/5778245/expressjs-how-to-structure-an-application) to a question about express app structure is super informative along with his 
  [public repo](https://github.com/focusaurus/peterlyons.com).  I'd hold off on looking at this until you've built up most of your site because it's alot of organizational and semantic stuff.

- [Dailyjs](http://dailyjs.com/2010/11/15/node-tutorial-3/) has a very nice tutorial about building a notepad web app with express and node. It's worth digging through even if you're not making an application because the configuration and controllers are implemented the same regardless.

#### Express / Jade / Stylus
TJ Holowaychuk has created an amazing trifecta of goodies here.  

##### Jade and Stylus
"Jade - a high performance template engine heavily influenced by Haml and implemented with JavaScript for node."
Jinja2, Django and *shudders* PHP templating are what I have to compare Jade to, so keep that in mind. 
Coming from python it was amazingly intuitive because you organize html elements via indented blocks. 
    
    {# jinja2 way of iterating a users list #}
    {% for user in users %}
      <li><a href="{{ user.url }}">{{ user.username }}</a></li>
    {% endfor %}
    
Whereas in jade you'd simply

    each user in users
      li a(href=user.url) #{user.username}
      
So much cleaner! I've only skimmed the [readme](https://github.com/visionmedia/jade#readme) so there might be other ways to do this, but I did give myself problems while trying to set up Poet 
because of using `#{post.url}` in an href instead of just `a(href=post.url)`.  
Anyway, it's very consistent, simple and is completely integrated and natural within an express application, so the choice is obvious.  The same goes for [Stylus](http://learnboost.github.com/stylus/) which is a less/sass type css compiled 'language'.  I don't know what people did before css variable names! You can see my use (to a ridiculous extent) [here](https://github.com/tippenein/brdyorn.com/blob/master/public/stylesheets/style.styl)

##### Express
The first controller I wrote was for simple static pages that would only require an `app.get(...)` 
This creates reusable code for later, but considering I have less than 8 static pages, this controller is rather useless in its current capacity. It is however nice to split up blog routes from normal page routes.

    /* in controllers/page.js */
    // create a Page object 
    function Page(uri, locals){
      this.uri    = uri;
      this.locals = locals;
      // deal with '/' index route
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

    function page(uri, locals, type){
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
    
The blog controller is similar, however mine is simplified since I'm using poet for blog purposes at the moment. Basically it comes down to a declaration of `module.exports.setup = function({...})` which defines all your routes..
    
    /* in site.js */
    controllers = ["pages", "blog"]
    for each (controller in controllers) {
      controller = require('./controllers/' + controller);
      controller.setup(app)
    }
    
I found out the hard way that Controllers (routes) must go after configure statements otherwise your post data won't be accessible via `req.post.param`.
