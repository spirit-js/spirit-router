This is a quick tutorial (in the style of a Learn X in Y minutes guide) to using spirit.

Code examples use ES6 syntax, async/await is supported, but examples aren't shown. The style omits ending in semi-colons, which you do not have to follow.

# Getting Started with spirit & spirit-router

spirit's purpose is to provide a minimal set of abstractions that make building a web application easier.
Some of it's goals to achieve:
- being more modular, almost everything in spirit can be replaced and other parts should be expected to still work
- separating HTTP related ideas and code from user code
- being more functional and modern (support for Promise & async/await)

spirit-router is just a router to route requests to your own code.

To get started, first install spirit and spirit-router:
`npm install spirit spirit-router`

## Creating Routes

A simple Hello World web app would look like this:

```js
const {adapter} = require("spirit").node
const route = require("spirit-router")

const app = route.define([
  route.get("/", "Hello World")
])

const http = require("http")
http.createServer(adapter(app)).listen(3000)
```

A route is created with `route.get("/", "Hello World")` which returns a 200 response with "Hello World" for any GET requests on /.
`spirit-router` exports a lot of common http methods for creating routes, so `route.post`, `route.delete`, etc. all work.

Routes are __always__ wrapped with `route.define` which takes an array of routes and creates a group.
Even though in this example there is only 1 route (`route.get("/", "Hello World")`), it is still needed to wrap it with `route.define`.

We can take any group of routes (what is returned by `route.define` which is `app` in this example) and pass it to `adapter` which creates a handler for node's `http.createServer`.

## Grouping Routes with define

When you group routes together, they can be re-used and can take a optional string prefix for routing.

```js
const {adapter} = require("spirit").node
const route = require("spirit-router")

const users = route.define("/users", [
  route.get("/", "Hello Users"),
  route.post("/", "You posted to /users")
])

const app = route.define([
  route.get("/", "Hello World"),
  users
])

const http = require("http")
http.createServer(adapter(app)).listen(3000)
```

In this example, our main group `app` also includes routes from `users`. And `users` has a string prefix "/users", which specifies that all routes inside the `users` group will only match if the request URL begins with "/users".

So a GET /users will return "Hello Users". But a GET / will return "Hello World". And additionally a POST /users will return "You posted to /users".

## Routes

Routes don't have to just return strings like the above examples with returning "Hello World". They can also be a function.

```js
const greet = () => {
  return "Hello World"
}

route.define([
  route.get("/", greet)
])

// #=> GET /
// { status: 200, 
//   headers: { "Content-Length": 11, "Content-Type": "text/html; charset=utf-8" }, 
//   body: "Hello World" }
```

And the function will be run when the request matches, which produces the same result as `route.get("/", "Hello World")`.

Routes also can use a string, string pattern, or regexp to match a request's path. They are exactly like in Express.

So our greet function can be more interesting:

```js
const greet = (name) => {
  return "Hello, " + name
}

route.define([
  route.get("/:name", ["name"], greet)
])

// #=> GET /test-name
// { status: 200, 
//   headers: { "Content-Length": 16, "Content-Type": "text/html; charset=utf-8" }, 
//   body: "Hello, test-name" }
```
Will match any GET request _except_ "/". So "/hello" works, "/test" will also work etc.
Which will produce a 200 response with "Hello, hello" and "Hello, test" respectively.

Notice that `["name"]` was added in as an additional argument to our route. This specifies that the value of "name" that was matched is needed in order to run `greet`, which is a form of dependency injection.

## Dependency Injection for Routes

Whenever a route relies on data from a request to run a route's function, then using dependency injection is needed (which in this case, is just a form of destructuring the request object with a string representing a property on the request object).

```js
const inspect = (url) => {
  return "You made a request to: " + url
}

route.define([
  route.get("*", ["url"], inspect)
])

// #=> GET /test-test
// { status: 200, 
//   headers: { "Content-Length": 33, "Content-Type": "text/html; charset=utf-8" }, 
//   body: "You made a request to: /test-test" }
```

Which looks up the property "url" from the [request map](https://github.com/spirit-js/spirit/blob/master/docs/api/request-response-map.md#request-map). 

However when a value is matched based on the params of a route's path, they take priority:
```js
const inspect = (url) => {
  return "You made a request to: /" + url
}

route.define([
  route.get("/:url", ["url"], inspect)
])
```
In this example, `url` is actually from request.params.url as matched by the route's path and not the request's url (request.url). 

Typically this is not an issue, as naming the param "url" is something you explicitly do, so that's why it takes precedent. 

You can specify multiple dependencies as well:
```js
const inspect = (name, url) => {
  return "Hi, " + username + ". You made a " + method + " " + url + " request"
}

route.define([
  route.get("/user/:name", ["name", "method", "url"], inspect)
])
```

## Async Route functions

When a route function needs to do async work like reading a file, calling a web api, etc. then you would return a promise.

In this example we'll read a file with node's `fs.readFile`, but since it doesn't return a Promise, we wrap it as one (there are 3rd party libraries that automatically do this for you, such as bluebird, which is recommended).

```js
const readfile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

route.define([
  route.get("/:filename", ["filename"], readfile)
])
```

Or an example using mongoose (mongodb library) and returning the results of a query:
```js
const db = (title) => {
  return Books.findOne({ name: title })
}

route.define([
  route.get("/api/books/:title", ["title"], db)
])
```

When dealing with files as responses, there is a helper function from spirit called `file_response` (or `fileResponse` if prefer camel case) example below.

## Returning Routes

Whatever is returned from a route is considered the response of a request. (_Except_ in the case of undefined, which `spirit-router` considers a pass and to find another matching route)

If the route is a function, then whatever is returned from the route function is the response.

All responses are converted to a response map, which is simply a object containing a status, headers property, and optionally a body property (`{ status: ..., headers: { ... }, body: ... }`).

The status and headers are assumed when not specified:
```js
const hello = () => {
  return "Hello World"
}
route.get("/", hello)

// #=> GET /
// { status: 200, 
//   headers: { "Content-Length": 11, "Content-Type": "text/html; charset=utf-8" }, 
//   body: "Hello World" }
```

If we wanted to specify different values we can return a response map instead of the value:

```js
const hello = () => {
  return {
    status: 500,
    headers: { "Content-Type": "text/plain" }
    body: "Hello World"
  }
}

// #=> 
// { status: 500, 
//   headers: { "Content-Type": "text/plain" }, 
//   body: "Hello World" }
```

But that can be cumbersome, spirit includes helper functions (response, file_response) for dealing with common responses:
```js
const {response} = require("spirit").node

const hello = () => {
  return response("Hello World").type("plain").status_(500)
}
route.get("/", hello)

// #=> GET /
// { status: 500, 
//   headers: { "Content-Length": 11, "Content-Type": "text/plain" }, 
//   body: "Hello World" }
```

For sending files as a response use `file_response` or `fileResponse` (alias):
```js
const {file_response} = require("spirit").node

const serve = () => {
  return file_response("path/to/file.js")
}
route.get("/", serve)

// #=> 
// { status: 200, 
//   headers: { "Content-Length": ..., "Last-Modified": ..., "Content-Type": "application/javascript" }, 
//   body: <File-Stream of file.js> }
```
The Content-Length, Last-Modified, Content-Type are automatically detected based on the file.


## Middleware
Middleware in spirit is just a function that takes a handler and returns a function that takes a request:
```js
(handler) => {
  return (request) => {
    return handler(request)
  }
}
```

Middleware flow both ways in spirit, that is they can operate solely on the input (request) or the output (response), or both.

If you wanted to do something based on the input (request), for example log the time the request came in:
```js
(handler) => {
  return (request) => {
    const timestamp = new Date()
    return handler(request)
  }
}
```

If we wanted to now do something based on the output (response), for instance set the Date header of every response to our `timestamp` value:
```js
(handler) => {
  return (request) => {
    const timestamp = new Date()
    return handler(request).then((response) => {
      return response.set("Date", timestamp)
    })
  }
}
```

or, the async/await version of the above:
```js
(handler) => {
  return async (request) => {
    const timestamp = new Date()
    const response = await handler(request)
    return response.set("Date", timestamp)
  }
}
```