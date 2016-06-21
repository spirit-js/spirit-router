# spirit-router
A router for [spirit](https://github.com/spirit-js/spirit).

It provides a _low level_ framework that can be extended through spirit. (it is _not_ a full stack framework or a boilerplate or web platform). It is meant as an alternative to Express, Koa, Hapi, etc.

[![Build Status](https://travis-ci.org/hnry/spirit-router.svg?branch=master)](https://travis-ci.org/hnry/spirit-router)
[![Coverage Status](https://coveralls.io/repos/github/hnry/spirit-router/badge.svg?branch=master)](https://coveralls.io/github/hnry/spirit-router?branch=master)

It __emphasizes clear separation of code between HTTP and your own code__. Routes are normal javascript functions. That means a route can be as simple as:
```js
function() { return "Hello World" }
```

This makes testing, re-using, and reading your code much easier, as _"it's just javascript"_.

## Features
* __Routes are just normal functions that return something__. No more proprietary (req, res, next) functions. This makes it easier to test, re-use, read your routes.

* __Compatible with Express middleware__. (via [spirit-express](https://github.com/hnry/spirit-express)) Re-using existing code is important.

* Error handling with then & catch. __Promises are "first class"__.

* __Fast, very fast__. It outperforms other web frameworks (Express, Koa).

## Example (in ES6)
```js
const http = require("http")
const spirit = require("spirit")
const route = require("spirit-router")

const home = (name) => {
  return "Hello, " + name
}

const app = route.define([
  route.get("/:name", ["name"], home)
])

const site = spirit.handler(app, [])
http.createServer(site).listen(3000)
```
More examples can be found in the [example dir](https://github.com/hnry/spirit-router/tree/master/examples).

## Getting Started
To install:
`npm install spirit-router`

You will also need [spirit](https://github.com/hnry/spirit):
`npm install spirit`

Some resources for getting started: (Not all written yet)

[Guide](https://github.com/hnry/spirit-router/tree/master/docs/guide) and [API Docs](https://github.com/hnry/spirit-router/tree/master/docs/api)

## Development Status
__I am in the middle of a re-write and re-organizing.__


__I need your help!__ If the project interests you, I would love help. Especially for doc contributions or just as simple as reporting feedback / bugs, etc.
