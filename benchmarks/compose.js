const Benchmark = require("benchmark")
const suite = new Benchmark.Suite

const compose = require("spirit").compose
const compose_args = require("../lib/router").compose_args

const handler = (req) => {
  return "ok"
}

const middleware = [
  (next) => {
    return (req) => {
      return handler(req)
    }
  },

  (next) => {
    return (req) => {
      return next(req)
    }
  }
]

const comp = compose(handler, middleware)
const comp_args = compose_args(handler, middleware)

const Promise = require("bluebird")
const no_comp = middleware[0](middleware[1](handler))

suite.add("compose", function(defer) {
  comp("ok").then(() => {
    defer.resolve()
  })
}, { defer: true })
  .add("compose_with_args", function(defer) {
    comp({}, "ok").then(() => {
      defer.resolve()
    })
  }, { defer: true })
  .add("manual (only promise wraps final result)", function(defer) {
    const p = new Promise((resolve, reject) => {
      resolve(no_comp("ok"))
    })

    p.then(() => {
      defer.resolve()
    })
  }, { defer: true })
  .on("cycle", function(event) {
    console.log(String(event.target))
  })
  .run({ "async": true })
