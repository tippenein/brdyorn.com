---
layout: post
title: Structure of 'call' in a programming language
---

### Grokking the 'call' construct
While implementing the MUPL (Made Up Programming Language) for a programming languages course I found call to be interesting. I'll underline some of the implementation here.

Now, call isn't necessarily a difficult concept. It's used all the time in
jQuery and javascript to alter the `this` of a function call and here we'll do
a similar thing, but it seems more fun because you're also using lexical scope
and closure environment within the call implementation. It's easier if I just
show some of the code.

<!--more-->

``` scheme
(define (eval-exp e)
    (eval-under-env e '())) ;; start with an empty list environment
```

This is what's called from within our language. Each expression has an environment which in this case is just a list of pairs of expressions. Briefly, when you create a struct you get helper function for checking an expression and the equivalent of getters. ex. `(struct add (e1 e2))` will allow you to test any expression with `(add? e)` and get `(+ add-e1 add-e2)` etc. These are the structs we care about here:

``` scheme
(struct call (funexp actual) #:transparent)
(struct closure (env fun) #:transparent)
```

### eval within a specific environment
The fun comes with defining `eval-under-env`. This is the given spec for implementing call.

> A call evaluates its first and second subexpressions to values. If the first is not a closure, it is an error. Else, it evaluates the closure's function's body in the closure's environment __extended to map the function's name to the closure__ (unless the name field is #f) and the functions argument to the result of the second subexpression.

``` scheme
(define (eval-under-env e env)
    (cond   [(var? e) (envlookup env (var-string e))]
            ;; ...more expression checking
            [(call? e)
```

eval-under-env is a large `cond` checking the given expression (`e`) within the given environment (`env`). The following is how we evaluate `call` expressions:

``` scheme
(let ([v1 (eval-under-env (call-funexp e) env)]
      [v2 (eval-under-env (call-actual e) env)])
    (if (closure? v1) ;; make sure first expression is a closure
        (let* [carg1 (closure-fun v1)]
              [carg2 (closure-env v1)]
              [cname (cons (fun-nameopt carg1) v1)]
              [cfunc (cons (fun-formal carg2) v2)])
```

The `let*` is basically allowing contiguous use of bindings within the same let binding (ex. `carg1` is used within the `cname` binding). After the args are set to cname and cfunc respectively, the function is evaluated within the specified closure-env (`carg2`) but we have to construct that environment.

``` scheme
(eval-under-env (fun-body carg1)
      (if (eq? (car cname) #f)
          (cons cfunc carg2)
          (cons cfunc (cons cname carg2))))
```

I've posted more of the MUPL implementation [here](https://gist.github.com/tippenein/5229968) if seeing the full bit of code would be helpful.

