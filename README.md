# spirited
A _fast_ simple & modern web framework for node.js, built from the ground up with [spirit](https://github.com/spirit-js/spirit)

It is a _low level_ framework (it is _not_ a full stack framework or a boilerplate or web platform). It is meant as an alternative to Express, Koa, Hapi, etc.

[![Build Status](https://travis-ci.org/spirit-js/spirited.svg?branch=master)](https://travis-ci.org/spirit-js/spirited)
[![Coverage Status](https://coveralls.io/repos/github/spirit-js/spirited/badge.svg?branch=master)](https://coveralls.io/github/spirit-js/spirited?branch=master)

It __emphasizes clear separation of code between HTTP and your own code__. Routes are normal javascript functions. That means a route can be as simple as:
```js
function() { return "Hello World" }
```

This makes testing, re-using, and reading your code much easier, as _"it's just javascript"_.

## Features
* __Routes are just normal functions that return something__. No more proprietary (req, res, next) functions. This makes it easier to test, re-use, read your routes.

* __Compatible with Express middleware__. Re-using existing code is important.

* Error handling with then & catch. __Promises are "first class"__.

* __Fast, very fast__. It outperforms other web frameworks (Express, Koa).

## Example (in ES6)
```js
const http = require("http")
const spirit = require("spirited")

const home = (name) => {
  return "Hello, " + name
}

const app = route.define([
  route.get("/:name", ["name"], home)
])

const site = spirit.handler(app, [])
http.createServer(site).listen(3000)
```
More examples can be found in the [example dir](https://github.com/spirit-js/spirited/tree/master/examples).

## Getting Started
To install:
`npm install spirited`

Some resources for getting started: (Not all written yet)

[Guide](https://github.com/spirit-js/spirited/tree/master/docs/guide) and [API Docs](https://github.com/spirit-js/spirited/tree/master/docs/api)

For a long read about the different designs, check out [spirit's design philosophy compared to Express](https://github.com/hnry/spirit/wiki/spirit's-design-philosophy-compared-to-express).

## Development Status
__I am in the middle of a re-write and re-organizing.__

The remaining work for spirited:

1. Docs, docs, docs!
2. Some proper response headers are still missing for certain sitatuions
3. http2 support (part of spirit-node-adapter)
4. Handling request headers for Not modified, if-not-modified

__I need your help!__ If the project interests you, I would love help. Especially for doc contributions or just as simple as reporting feedback / bugs, etc.


## FAQ
#### How about isomorphic support?
`spirited` does not have any built-in support, but since it's built on top of [spirit](https://github.com/spirit-js/spirit) it should have no problem being extended to do so.

Rendering React components would just be like rendering templates. As far as the routing goes, it is not isomorphic. But I have plans for that (after everything elses is done).
