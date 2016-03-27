---
layout: post
title: REST exception handling with decorators
tags: [decorators, REST, exceptions, python]
---

### Raising REST exceptions
I can't decide if this is the "right" way of doing this, but it seems
relatively succinct, so I'll attempt to describe how I handled exceptions for a
REST api in django.

Say you need to return user info and the info given for user lookup fails.

{% highlight python %}
import users
import exceptions
import rest_exceptions as rest_excs
import decorators.rest as rest

@rest.exceptions
def get_user_info(input_name):
try:
    user = users.get_user(input_name)
except exceptions.NoSuchUser
    raise rest_exc.NoSuchUser
{% endhighlight %}

- The `exceptions` import is for general error catching and it allows you to
  collect all your exception definitions for specific modules.
- `decorators.rest` holds... well, decorator functions specific to REST stuff.
  You don't need a separate directory `decorators` but I happened to have more
  decorator types than were sensible to put in the main modules dir..
- `rest_exceptions` is similar to exceptions but these will need to define a
  status code to return and inherit from a exception class we define called
  `RestException`


###Exception Decorator
So, catch the general exception, raise the REST exception... but then what?
This is where the decorator comes in. It handles when a rest exception is raised and returns an appropriate response.

<script src="https://gist.github.com/tippenein/6188769.js"></script>

You'd define the base exception class, `RestException` as:

{% highlight python %}
class RestException(Exception):
    code = 500
    message = {"reason" : "failed"}
    response = None
{% endhighlight %}

Define all the specific exceptions with this as the base class (ex. `PermissionDenied(RestException)`).  This way you can specify the status code and response for each type of exception.

The JSONResponse object:

<script src="https://gist.github.com/tippenein/6188792.js"></script>

Basically just returning an HttpResponse encoded properly as json. You'd want to check kwargs for a status as well.

If multiple modules have a REST api this would help to generalize the exception handling. I'm sure there are other/better ways of doing this and I'd love to know what they are. Even if it is a crap way of doing it, maybe you can use the idea to implement something else.

###Bottom line: Decorators are fun

