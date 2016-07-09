const router = require("../lib/router")

describe("router", () => {

  describe("_lookup", () => {
    // setup some routes for testing
    const _routes = require("../lib/routes")
    const routes = _routes.verbs

    let compiled_routes = [
      routes.get("/", [], ()=>{}),
      routes.post("/", [], ()=>{}),
      routes.get("/bloop/test", [], ()=>{}),
      _routes.verb("cuStom", "/", [], ()=>{}),
    ]
    compiled_routes = compiled_routes.map((r) => {
      return _routes.compile.apply(undefined, r)
    })


    it("looks up route", () => {
      let r = router._lookup(compiled_routes[0], "get", "/")
      expect(r[0]).toBe("/")
      expect(r instanceof Array).toBe(true)

      r = router._lookup(compiled_routes[2], "get", "/bloop/test")
      expect(r[0]).toBe("/bloop/test")
      expect(r instanceof Array).toBe(true)

      // doesn't match anything
      compiled_routes.forEach((route) => {
        r = router._lookup(route, "get", "/bloop/test/123")
        expect(r).toBe(undefined)
      })
    })

  })

  describe("_destructure", () => {
    it("returns values in the same order as keys passed in", () => {
      let result = router._destructure(["a", "c", "b"], {a: 1, b: 2, c: 3})
      expect(result).toEqual([1, 3, 2])
    })

    it("can get the value of a nested object", () => {
      const result = router._destructure([["a", "nested"], "b"], {
        a: {
          c: 123,
          nested: "nest"
        },
        b: "ok",
        c: "notok"
      })

      expect(result).toEqual(["nest", "ok"])
    })

    it("is ok with falsey values and returns them", () => {
      // note: the undefined here is only one that isn't
      // returned "directly"
      const keys = [["a", "nested"], "b", "c", "d", "e"]
      const obj = {
        a: {
          nested: null
        },
        b: 0,
        c: false,
        d: undefined,
        e: ""
      }
      const r = router._destructure(keys, obj)
      expect(r[0]).toBe(null)
      expect(r[1]).toBe(0)
      expect(r[2]).toBe(false)
      expect(r[3]).toBe(undefined)
      expect(r[4]).toBe("")
    })

    it("gives priority to params over the root", () => {
      const keys = ["a", "b"]
      const obj = {
        a: 1,
        params: { a: 123 },
        b: 2
      }
      const r = router._destructure(keys, obj)
      expect(r).toEqual([123, 2])
    })
  })

  describe("wrap", () => {
    it("accepts a single function as a middleware", (done) => {
      const middleware = (handler) => {
        return (request) => {
          return handler(request).then((resp) => {
            resp.body += "123"
            return resp
          })
        }
      }

      const fn = router.wrap(["get", "/", [], "hello"], middleware)
      fn({url: "/", method: "get"}, "").then((resp) => {
        expect(resp.body).toBe("hello123")
        done()
      })
    })

    it("guards against invalid type for middleware", () => {
      const route = ["get", "/", [], "hello"]
      expect(router.wrap.bind(null, route)).toThrowError(/Expected `wrap`/)
      expect(router.wrap.bind(null, route, "")).toThrowError(/Expected `wrap`/)
      expect(router.wrap.bind(null, route, {})).toThrowError(/Expected `wrap`/)
      expect(router.wrap.bind(null, route, [])).not.toThrow()
    })
  })

})
