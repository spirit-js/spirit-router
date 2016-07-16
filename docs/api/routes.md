`spirit-router` uses _Routes_ for routing incoming HTTP requests.

A Route is defined by a http method, a URL path to match, arguments for the body, and the body.

To create Routes, `spirit-router` exports `get`, `put`, `post`, `delete`, `head`, `options`, `patch`.

If you noticed the names correspond to HTTP methods. And when used, it creates a Route with the corresponding API name as it's HTTP method.

And they can be used like so, route._api name_( _path_, _args_, _body_ )

The exception being, `any` which creates a Route that matches any method.

If there is a HTTP method not exported as an API, you can create it with [method](#method) API. Internally `spirit-router` uses [method](#method) to create `get`, `put`, `post`, etc.

The return of using any of these APIs is a simple array holding the arguments used. And is considered an _uncompiled Route_. When they are passed to [define](api.md#define), they are then _compiled_ and wrapped with a router function.

### Arguments

##### path
Example:
```js
  const route = require("spirit-router")

  route.get("/", [], "Hello World")
```
This creates a Route that will match any GET request for the URL "/".

Can be a string or string pattern or regexp. It is used for matching a incoming requests URL. 

> NOTE: It is compatible with Express's routing path. Internally, both use [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) module for matching paths.

##### args
Can either be an array of strings or undefined (`[]` in the above example). 
They are used to denote dependencies needed for this Route to run. The dependencies are looked up on the request map via destructuring with strings.

To illustrate better:
```js
  const greet = (url) => {
    return "Hello! Thanks for visiting " + url
  }
  
  route.get("*", ["url"], greet)
```

In this example the Route's path (first argument) is set to "*", which will match any GET request.

`["url"]` specifies that our `greet` function requires the value of url from the request map in order to run successfully. It is looked up on the request map and provided to the `greet` function when the Routeis ran.

##### body
The body of the Route. It defines what happens when the Route is matched and what response is returned. The body can be of any [renderable](api.md#render) type or a function that returns a renderable type.

The returned response can be wrapped as Promise.


-----------------------------------------------------


# method

Returns an array of it's arguments, for example:
```js
method("get", "/", [], "Hello World") 
// => ["get", "/", [], "Hello World"]
```

The array is considered to be a _uncompiled_ Route. When passed to [define](api.md#define) it will be compiled into a function that is then wrapped with a router.

`method` is a HTTP method to match on, and will always internally be converted to upper case, so `get` will be `GET`.

`path` is a string or string pattern or regexp used for matching a request's URL. It is the same as in Express, as both use the [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) module.

`args` is a an array of strings that represent dependencies `body` needs. The strings are destructured or looked up against the incoming request map.

`body` specifies what to return as a response when this Route's `method` and `path` are matched. If it's a function, it will be called with arguments specified in `args`.

[Source: src/routes.js (verb)](../../src/routes.js#L97)

#### Arguments
* method {string} HTTP method to associate with this Route
* path {string|regexp} A string, string pattern, or regexp used for matching a request to this Route
* args {undefined|array} An array of dependencies represented as a string for `body`
* body {*} The result or response of this Route

#### Return
{array} A uncompiled Route, which is just an array of the arguments used

