`spirit-router` uses _Routes_ for routing incoming HTTP requests.

A Route is defined by a http method, a URL path to match, arguments for the body, and the body.

To create Routes, `spirit-router` exports `get`, `put`, `post`, `delete`, `head`, `options`, `patch`.

If you noticed the names correspond to HTTP methods. And when used, it creates a Route with the corresponding API name as it's HTTP method.

And they can be used like so, route._api_name_( _path_, _args_, _body_ )

Examples:
```js
get("/", "Hello World")
get("/", [], "Hello World") // identical to the above
post("/login", ["username", "password"], login)
get("/:name", ["name"], greeter)
```

It also exports `any` which creates a Route that matches any method. (Ex: `any("/", ["arg", function(arg) {}])`)

If there is a HTTP method not exported as an API, you can create it with [method](#method) API. Internally `spirit-router` uses [method](#method) to create `get`, `put`, `post`, etc.

The return of using any of these APIs is a simple array holding the arguments used. And is considered an _uncompiled Route_. When they are passed to [define](api.md#define), they are then _compiled_ and wrapped with a router function.

#### Destructuring Arguments
Routes use a form of dependency injection when the Route's body is a function. This is a key abstraction in `spirit-router` to keep your code free of HTTP related cruft.

For example:
```js
const echo = (url) => {
  return "You are currently browsing: " + url
}

any("*", ["url"], echo)
```
Which will echo back the current URL. The `any("*", ...)` matches any request method for any path. 
`["url"]` refers to the property "url" on the [request](https://github.com/spirit-js/spirit/blob/master/docs/api/request-response-map.md#request-map) object, which in this example is the current URL of a request.
The value of the `request.url` property will then be used to call `echo` similarly to `echo(request.url)`.

For example:
```js
const greeter = (name) => {
  return "Hello, " + name
}

get("/:name", ["name"], greeter)
```

In the example `["name"]` will be used to destructure (or looked up) against a property on the request. The `name` property in the request map will be populated because of our string pattern in _path_ `"/:name"`. The value of the `name` property will then be used to call `greeter` if the Route matched successfully.

__NOTE:__ The "name" property in this example doesn't exist on the request actually. It exists on request.params which gets populated because of our path "/:name". In `spirit-router` the params property has priority on look ups over the actual request. This is to make it easier, if we wanted to be specific we would use an array to look up, for example: `[["params", "name"]]`.

If the property doesn't exist on "params" it will look it up on the request, like the prior example with `["url"]`. 

It is best to avoid situations like these when possible:
```js
get("/users/:url", ["url"], some_route_handler)
```
As the `["url"]` in this example will be the one that is matched through the path (request.params.url) and not the full request url (request.url). It's better to just specify a different name, as it's unclear anyway in this example.

However you can always use a specific look up to always get the correct result, `[["params", "url"]]` or, if you meant the url for the actual request, `[["request", "url"]]` or if both, `["url", ["request", "url"]]`. But again, it would be silly to have them both named "url".

-----------------------------------------------------


# method

Returns an array of it's arguments, for example:
```js
method("get", "/", [], "Hello World") 
// => ["get", "/", [], "Hello World"]
```

`args` and `body` are both optional. And if only one is provided, `body` is assumed. So the above example can also be written:
```js
method("get", "/", "Hello World") 
// => ["get", "/", [], "Hello World"]
```

Internally, this is used to create helper functions for creating routes, as seen with `get, post, delete, put, any` etc.

The returned array is considered to be a _uncompiled_ Route. When passed to [define](api.md#define) it will be compiled into a function that is then wrapped with a router.

`method` is a HTTP method to match on, and will always internally be converted to upper case, so `get` will be `GET`. If a "*" is used, it will match any HTTP method.

`path` is a string or string pattern or regexp used for matching a request's URL. It is the same as in Express, as both use the [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) module.

`args` (optional) is a an array of strings that represent dependencies `body` needs. The strings are destructured against the incoming request map. For more information about how the arguments are destructured see [Destructuring Arguments](#destructuring-arguments).

`body` (optional) specifies what to return as a response when this Route's `method` and `path` are matched. If it's a function, it will be called with arguments specified in `args`.

[Source: src/routes.js (verb)](../../src/routes.js#L97)

#### Arguments
* method {string} HTTP method to associate with this Route
* path {string|regexp} A string, string pattern, or regexp used for matching a request to this Route
* args {undefined|array} An array of dependencies represented as a string for `body`
* body {*} The result or response of this Route

#### Return
{array} A uncompiled Route, which is just an array of the arguments used

