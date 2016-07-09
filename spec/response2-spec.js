const {route_handler} = require("../lib/router")
const {create} = require("../lib/response-map")
const Promise = require("bluebird")

// collect all ResponseMap(val) used for testing
// in sample_values
const sample_values = []
function create_rmap(v) {
  sample_values.push(v)
  return create(v)
}

// every return from route should become a ResponseMap
// if it isn't one already
// except for the case of undefined
describe("route returns", () => {

  const test_runner = (val, validation, done) => {
    // test the original val
    route_handler(val, [])({}).then((result) => {
      validation(result)
    })
    // if val is ResponseMap
    // test wrapping body as a Promise
      .then(() => {

      })
    // test the original val wrapped as a Promise
      .then(() => {
        route_handler(Promise.resolve(val), [])({}).then((result) => {
          validation(result)
          done()
        })
      })
  }

  // which means to programmatically skip this route
  describe("undefined", () => {
    const test = (result) => {
      expect(result).toBe(undefined)
    }

    it("-> undefined", (done) => {
      test_runner(undefined, test, done)
    })
  })

  // empty response
  describe("null, ResponseMap(), ResponseMap(''), ResponseMap(null)", () => {
    const test = (result) => {
      expect(result.status).toBe(200)
      expect(result.headers).toEqual({})
      expect(result.body).toBe("")
    }

    it("-> null", (done) => {
      pending()
      test_runner(null, test, done)
    })

    it("-> ResponseMap()", (done) => {
      pending()
      test_runner(create_rmap(), test, done)
    })

    it("-> ResponseMap(undefined)", (done) => {
      pending()
      test_runner(create_rmap(undefined), test, done)
    })

    it("-> ResponseMap('')", (done) => {
      pending()
      test_runner(create_rmap(""), test, done)
    })

    it("-> ResponseMap(null)", (done) => {
      pending()
      test_runner(create_rmap(""), test, done)
    })
  })

  describe("string - always assumes html type and utf-8", () => {
    const test = (result) => {
      expect(result.status).toBe(200)
      expect(result.headers).toEqual({
        "Content-Type": "text/html; charset=utf-8"
      })
      expect(result.body).toBe("hello")
    }

    it("-> string", (done) => {
      test_runner("hello", test, done)
    })

    it("-> ResponseMap(string)", (done) => {
      test_runner(create_rmap("hello"), test, done)
    })
  })

  describe("number", () => {
    const test = (result) => {
      expect(result.status).toBe(200)
      expect(result.headers).toEqual({})
      expect(result.body).toBe("123")
    }

    it("-> number")
    it("-> ResponseMap(number)")
  })

  describe("boolean", () => {
    it("-> boolean")
    it("-> ResponseMap(boolean)")
  })

  describe("buffer", () => {
    it("-> buffer")
    it("-> ResponseMap(buffer)")
  })

  describe("stream", () => {
    it("-> stream")
    it("-> ResponseMap(stream)")
  })

  describe("array or object (that is not null, response map, ResponseMap, Stream, Buffer)", () => {
    it("-> array")
    it("-> ResponseMap(array)")
    it("-> object")
    it("-> ResponseMap(object)")
  })

  // a (literal) response map is basically left untouched
  // except in the case of a Promise, the promise will
  // be resolved, but otherwise untouched
  describe("response map", () => {
    it("is left as-is and is converted to a ResponseMap", (done) => {
      console.log(sample_values)
      pending()
      const rmap = { status: 123, headers: {a: 1}, body: "hello"}
      test_runner(rmap, test, done)
    })
  })

})
