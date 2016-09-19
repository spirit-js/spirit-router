const route_handler = require("../lib/routes").make_handler
const {Response, response} = require("spirit").node
const Promise = require("bluebird")
const fs = require("fs")
const stream = require("stream")

// every return from route should become a Response
// if it isn't one already
// except for the case of undefined
describe("(render) return from route ->", () => {
  const expect_response = (status, headers, body) => {
    return (result) => {
      expect(result instanceof Response).toBe(true)
      expect(result.headers).toEqual(headers)
      expect(result.status).toBe(status)
      expect(result.body).toBe(body)
    }
  }

  const test_runner = (val, validation, done) => {
    // test the original val
    route_handler(val, [])({}).then((result) => {
      validation(result)
    })
    // test the original val wrapped as a Promise
      .then(() => {
        route_handler(Promise.resolve(val), [])({}).then((result) => {
          validation(result)
          done()
        })
      })
  }

  describe("undefined", () => {
    // which means to programmatically skip this route
    // will never make it to conversion to Response
    it("->", (done) => {
      const test = (result) => {
        expect(result).toBe(undefined)
      }
      test_runner(undefined, test, done)
    })

    it("-> Response", (done) => {
      test_runner(response(undefined), expect_response(200, {}, undefined), done)
    })

    it("-> response map", (done) => {
      const t = { status: 123, headers: {}, body: undefined }
      test_runner(t, expect_response(t.status, t.headers, t.body), done)
    })
  })

  describe("null", () => {
    it("->", (done) => {
      test_runner(null, expect_response(200, {}, undefined), done)
    })

    it("-> Response", (done) => {
      test_runner(response(null), expect_response(200, {}, null), done)
    })

    it("-> response map", (done) => {
      const t = { status: 23, headers: {}, body: null }
      test_runner(t, expect_response(t.status, t.headers, t.body), done)
    })
  })

  describe("string", () => {
    it("->", (done) => {
      const headers = {
        "Content-Type": "text/html; charset=utf-8"
      }
      test_runner("hello", expect_response(200, headers, "hello"), done)
    })

    it("-> empty string", (done) => {
      test_runner("", expect_response(200, {}, ""), done)
    })

    it("-> Response", (done) => {
      const h = {
        "Content-Type": "text/html; charset=utf-8"
      }
      test_runner(response("hi"), expect_response(200, h, "hi"), done)
    })

    it("-> response map", (done) => {
      const t = { status: 223, headers: {}, body: "" }
      test_runner(t, expect_response(t.status, t.headers, t.body), done)
    })
  })

  describe("number", () => {
    // basically nothing happens
    it("->", (done) => {
      test_runner(123, expect_response(200, {}, 123), done)
    })

    it("-> Response", (done) => {
      const h = {
        a: 123
      }
      const r = response(3.14)
      r.headers = h
      test_runner(r, expect_response(200, h, 3.14), done)
    })

    it("-> response map", (done) => {
      const r = { status: 98, headers: { a: 1 }, body: 3.14 }
      test_runner(r, expect_response(r.status, r.headers, r.body), done)
    })
  })

  describe("boolean", () => {
    // nothing happens
    it("->", (done) => {
      test_runner(true, expect_response(200, {}, true), done)
    })
  })

  describe("buffer", () => {
    it("->", (done) => {
      const b = new Buffer("hello")
      const h = {
        "Content-Type": "text/html; charset=utf-8"
      }
      test_runner(b, expect_response(200, h, b), done)
    })

    // same as returning a buffer, except html not assumed
    it("-> Response", (done) => {
      const b = new Buffer("hello")
      const h = {}
      test_runner(response(b), expect_response(200, h, b), done)
    })
  })

  describe("stream", () => {
    it("-> file", (done) => {
      const test_file = __dirname + "/../index.js"
      const f = new fs.createReadStream(test_file)
      fs.stat(test_file, (err, file) => {
        const h = {
          "Content-Type": "application/javascript",
          "Content-Length": file.size,
          "Last-Modified": file.mtime.toUTCString()
        }
        test_runner(f, expect_response(200, h, f), done)
      })
    })

    it("-> stream (not file)", (done) => {
      const s = new stream.Readable()
      test_runner(s, expect_response(200, {}, s), done)
    })
  })

  describe("array or object (that is not null, response map, ResponseMap, Stream, Buffer)", () => {
    it("-> array", (done) => {
      const b = JSON.stringify([1, 2, 3])
      const h = {
        "Content-Type": "application/json"
      }
      test_runner([1,2,3], expect_response(200, h, b), done)
    })

    it("-> object", (done) => {
      const t = { a: 123, b: { c: "hi"} }
      const b = JSON.stringify(t)
      const h = {
        "Content-Type": "application/json"
      }
      test_runner(t, expect_response(200, h, b), done)
    })
  })

})
