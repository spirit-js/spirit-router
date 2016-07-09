/*
 * This file is for running internal benchmarks
 * against different commits
 *
 * The point is not to gauge overall speed, but relative
 * speed between each commit to know when certain changes
 * introduced drastic performance dips.
 * Which could be the result of a bug or needing better implementation.
 */
const Benchmark = require("benchmark")
const suite = new Benchmark.Suite

const {route} = require("../index")

const assert = require("assert")

const other = route.define("/other", [
  route.get("/a", [], () => { return "nope" }),
  route.get("/b", [], () => { return "nope" })
])

const long_routes = route.define([
  route.get("/a", [], () => { return "nope" }),
  route.get("/b", [], () => { return "nope" }),
  route.get("/c", [], () => { return "nope" }),
  route.get("/c", [], () => { return "nope" }),
  route.get("/d", [], () => { return "nope" }),
  route.get("/e", [], () => { return "nope" }),
  route.get("/f", [], () => { return "nope" }),
  route.get("/g", [], () => { return "nope" }),
  route.get("/h", [], () => { return "nope" }),
  route.get("/i", [], () => { return "nope" }),
  route.get("/j", [], () => { return "nope" }),
  route.get("/", [], () => { return "Hello World" })
])

const single_route = route.define([
  route.get("/", [], () => { return "Hello World" })
])

const test_long_route = function(cb) {
  const app = route.define([
    other,
    long_routes
  ])
  app({ method: "GET", url: "/" }).then(cb)
}

const middleware = (handler) => {
  return (request) => {
    return handler(request)
  }
}

const test_long_with_middleware = function(cb) {
  const app = route.define([
    route.wrap(other, [middleware, middleware]),
    route.wrap(long_routes, middleware)
  ])
  app({ method: "GET", url: "/" }).then(cb)
}

const test_single_route = function(cb) {
  single_route({ method: "GET", url: "/" }).then(cb)
}

const test_single_with_middleware = function(cb) {
  const app = route.wrap(single_route, [middleware, middleware, middleware])
  app({ method: "GET", url: "/" }).then(cb)
}

const nested = route.define("/test", [
  route.define("/a", [ route.define("/b", [ route.define("/c", [ route.define("/d", [
    route.get("/1", [], "nope"),
    route.get("/2", [], "nope"),
    route.get("/", [], "Hello World"),
  ]) ]) ]) ])
])

const test_nested_route = function(cb) {
  const app = route.define([
    nested
  ])
  app({ method: "GET", url: "/test/a/b/c/d" }).then(cb)
}

// tests the benchmark tests before actually running
const tester = function(result) {
  assert.strictEqual(result.status, 200)
  assert.strictEqual(result.body, "Hello World")
}
test_long_route(tester)
test_long_with_middleware(tester)
test_single_route(tester)
test_single_with_middleware(tester)
test_nested_route(tester)


suite.add("long routes", function(deferred) {
  test_long_route(function() {
    deferred.resolve()
  })
}, { defer: true })
  .add("single route", function(deferred) {
    test_single_route(function() {
      deferred.resolve()
    })
  }, { defer: true })
  .add("nested route", function(deferred) {
    test_nested_route(function() {
      deferred.resolve()
    })
  }, { defer: true })
  .add("long route with middleware", function(deferred) {
    test_long_with_middleware(function() {
      deferred.resolve()
    })
  }, { defer: true })
  .add("single route with 3 middleware", function(deferred) {
    test_single_with_middleware(function() {
      deferred.resolve()
    })
  }, { defer: true })
  .on("cycle", function(event) {
    console.log(String(event.target))
  })
  .run({ "async": true })
