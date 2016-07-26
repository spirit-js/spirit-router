# spirit-router
A router for [spirit](https://github.com/spirit-js/spirit).

When combined with spirit, it provides a _low level_ extensible framework (it is _not_ a full stack batteries included framework or a boilerplate). It is meant as an alternative to Express, Koa, and Hapi.

[![Build Status](https://travis-ci.org/spirit-js/spirit-router.svg?branch=master)](https://travis-ci.org/spirit-js/spirit-router)
[![Coverage Status](https://coveralls.io/repos/github/spirit-js/spirit-router/badge.svg?branch=master)](https://coveralls.io/github/spirit-js/spirit-router?branch=master)
[![Join the chat at https://gitter.im/spirit-js/spirit](https://badges.gitter.im/spirit-js/spirit.svg)](https://gitter.im/spirit-js/spirit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


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

## Example
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

Resources for getting started:

- [Guide](https://github.com/spirit-js/spirit-router/tree/master/docs/Guide.md)
- [API Docs](https://github.com/spirit-js/spirit-router/tree/master/docs/api)
- [Examples](https://github.com/spirit-js/spirit-router/tree/master/examples)

For those who prefer video tutorials, there will be video series soon.

## Contributing
All contributions are appreciated and welcomed.

For backwards incompatible changes, or large changes, it would be best if you opened an issue before hand to outline your plans (to avoid conflict later on).

The code style omits ending semi-colons. It also does not use camel case. And one-liners should be avoided unless it's very clear.

To run tests, use `make test`. This will also build changes to src/*, if you do not have "make" installed, you can look at the Makefile to see the steps to accomplish the task.
