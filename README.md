# spirit-router
A router for [spirit](https://github.com/spirit-js/spirit).

When combined with spirit, it provides a _low level_ extensible framework (it is _not_ a full stack batteries included framework or a boilerplate). It is meant as an alternative to Express, Koa, and Hapi.

[![Build Status](https://travis-ci.org/spirit-js/spirit-router.svg?branch=master)](https://travis-ci.org/spirit-js/spirit-router)
[![Coverage Status](https://coveralls.io/repos/github/spirit-js/spirit-router/badge.svg?branch=master)](https://coveralls.io/github/spirit-js/spirit-router?branch=master)

It __emphasizes clear separation of code between HTTP and your own code__. Routes are normal javascript functions. That means a route can be as simple as:
```js
function() { return "Hello World" }
```

This makes testing, re-using, and reading your code much easier, as _"it's just javascript"_.

## Features
* __Routes are just normal functions that return something__. No more proprietary (req, res, next) functions. This makes it easier to test, re-use, read your routes.

* __Compatible with most Express middleware__. (via [spirit-express](https://github.com/spirit-js/spirit-express)) Re-using existing code is important.

* Error handling with then & catch. __Promises are "first class"__. And so async/await compatible.

* __Fast, fast!__. It outperforms other web frameworks (Express, Koa).

## Example (in ES6)
```js
const {adapter} = require("spirit").node
const route = require("spirit-router")
const http = require("http")

const greet = (name) => {
  return "Hello, " + name
}

const app = route.define([
  route.get("/:name", ["name"], greet)
])

http.createServer(adapter(app)).listen(3000)
```

More examples in the [examples dir](https://github.com/spirit-js/spirit-router/tree/master/examples)

## Getting Started
To install:
`npm install spirit spirit-router`

Resources for getting started: (Not all written yet)

- [Quick Tutorial](https://github.com/spirit-js/spirit-router/tree/master/docs/tutorial)
- [In Depth Guide](https://github.com/spirit-js/spirit-router/tree/master/docs/guide)
- [API Docs](https://github.com/spirit-js/spirit-router/tree/master/docs/api)
- [Examples](https://github.com/spirit-js/spirit-router/tree/master/examples)

For those who prefer video tutorials, there will be video series soon.
