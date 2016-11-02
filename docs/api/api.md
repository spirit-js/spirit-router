- [define](#define)
- [wrap](#wrap)
- [render](#render)
- [not_found](#not_found)
- [resources](#resources)


-------------------------------------------


# define

It compiles `routes` being passed in, turning them into functions that are wrapped by an internal router.

`routes` are functions that have been wrapped by a router or uncompiled [Routes](routes.md).

It reduces over them until a route matches __and__ returns a response.

It optionally takes a `named` argument which is a string used to match the prefix of a incoming request's URL. If there is a match, then `routes` will be checked. If the prefix of URL does not match `named` then all `routes` are essentially skipped.

`named` can be considered preprending a string to all passed in Routes path.

Note that `named` is a string, not a string pattern or regexp.

Example:
```js
define("/greet", [
  get("/hello", [], "Hello!")
])
```
This would match URLs "/greet/hello" or "/greet/hello/".

It returns a compatible spirit handler that also takes an additional prefix and middlewares argument. And is also considered a routing function in `spirit-router`.

[Source: src/router.js (define)](../../src/router.js#L147)

#### Arguments
* named {string} optional, URL prefix to match on
* routes {array} uncompiled Routes, or routing functions

#### Return
{function} compatible spirit handler, and also a `spirit-router` routing function


-------------------------------------------


# wrap

It wraps `route` with `middlewares`. Reducing `middlewares` in order of first to last and then finally `route`.

`middlewares` are spirit middlewares.

It is essentially setting route specific middlewares.

The `route` must match the request URL first before `middlewares` or the `route` itself is ever called.

Note that the return value of `route` will flow back or rewind through `middlewares` just like in [spirit](https://github.com/spirit-js/spirit).

`route` can be a [Route](routes.md) or a routing function (created through [define](#define)) with `middlewares`. So `wrap` can be used in both situations.

Example:
```js
define([
  wrap(get("/", [], "Hello World"), middlewares)
])

// or

const app = define([
  get("/", [], "Hello World")
])

wrap(app, middlewares)
```

Both examples are functionally equivalent but there are subtle differences. 

The first is more specific to a route and will only run `middlewares` for that route.

The second is wrapping all routes in the define and so `middlewares` will be ran _once_ but after `define()` matches but before `get()` matches, but since there is only one, they would produce the same results. 

[Source: src/router.js (wrap)](../../src/router.js#L196)

#### Arguments
* route {string} a Route or a routing function
* middlewares {array} an array of spirit middlewares

#### Return
{function} compatible spirit handler, and also a `spirit-router` routing function


-------------------------------------------


# render

`render` is an extendable object with properties that describe how to render return values from a [Route's](routes.md) body into a spirit Response.

Usually you won't ever need to use this because a lot of common types are already pre-defined on how to render them into a Response.

However if one is missing or you want to replace the default functionality, you would use this to do so.

Determining the type of a value returned by a Route is done through spirit's type_of API. Which can detect common types as well as array, buffer, stream, file-stream, null.

NOTE: the return type of a Route will never be a Promise, it'll always be resolved to it's true value beforehand. And if the return type is a valid spirit.node response map or Response it'll skip this rendering process as it's already a valid response.

Example:
```js
const spirit = require("spirit")

render.string = (request, body) => {
   return spirit.response(body)
}
```

Will produce a Response with the return value of a Route's body set as the Response's body _whenever_ the return value of Route's body is a string.

Or:
```js
render.number = (request, body) => {
  body = (body + 100).toString()
  return spirit.response(body)
}
```
If a Route's body returns a number, this render function will run. Adding 100 to the number returned and converting it into a string and returning a Response with it set as it's response body.


[Source: src/render.js (renderables)](../../src/render.js#L17)


-------------------------------------------


# not_found

`notFound` is an alias to `not_found`

Convience function for creating a route that always returns a 404 Response with `body` as it's body.

`body` will go through _rendering_.

[Source: src/resource.js (not_found)](../../src/resource.js#L47)

#### Arguments
* method {string} optional, restricts not_found to a certain http method, otherwise matches all
* body {*} the body of not_found's Response

#### Return
{function} a routing function that always returns a 404 Response with `body`


-------------------------------------------


# resources

A GET route that returns resources from `options.root` as a Response. If the file resource doesn't exist, this route will be skipped.

`mount_path` is an optional argument for specifying a virtual mount point for `resources` to match. For example:
```js
resources("/files")
```
Given a GET request for "/files/css/style.css" it will look up the resource at `options.root` + "css/style.css"

By default `options` has the following properties:
`{ root: "public/", mime: {} }`

`options.mime` can be used to specify a mime type to set for the Response based on the file's extension (the "." should be included). For example: `resources({ mime: {".html", "text/html"} })`. If no match is found, it'll look up the mime type via [mime](https://www.npmjs.com/package/mime) module.

[Source: src/resource.js (resources)](../../src/resource.js#L6)

#### Arguments
* mount_path {string} optional, virtual URL path to serve file resources from
* options {object} A map (object literal) of options to set

#### Return
{function} a routing function that always matches any request and runs (cannot be wrapped with middlewares)

