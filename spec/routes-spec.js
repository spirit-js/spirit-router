const routes = require("../lib/routes")

describe("routes", () => {

  it("exports some default shortcut http verb fn for compiling", () => {
    const r = routes.verbs
    expect(typeof r.get).toEqual("function")
    expect(typeof r.put).toEqual("function")
    expect(typeof r.post).toEqual("function")
    expect(typeof r.delete).toEqual("function")
    expect(typeof r.patch).toEqual("function")
    expect(typeof r.options).toEqual("function")
    expect(typeof r.any).toEqual("function")
    expect(r.notexist).toBe(undefined)

    // basically returns an array of it's argument plus .method
    const fn = function() {}
    let route = r.get("/path", [], fn)
    expect(route).toEqual(["get", "/path", [], fn])

    route = r.delete("/path/:name", ["a"], fn)
    expect(route).toEqual(["delete", "/path/:name", ["a"], fn])
  })

  it("verb - returns an array of it's arguments", () => {
    const fn = function() {}
    const r = routes.verb("Balsf2", "/1/2/3", [], fn)
    expect(r instanceof Array).toBe(true)
    expect(Array.isArray(r)).toBe(true)
    expect(r).toEqual(["Balsf2", "/1/2/3", [], fn])
  })

  describe("compile", () => {
    it("turns arguments useful for determining a route into a Route object", (done) => {
      const fn = (a)=>{ return a }
      const Route = routes.compile("GeT", "/some/path", ["blAh"], fn)
      expect(Object.keys(Route)).toEqual(["method", "path", "handler"])
      expect(Route.method).toBe("GET")
      //expect(Route.args).toEqual(["blAh"])
      //expect(Route.body).toBe(fn)
      expect(typeof Route.handler).toBe("function")
      expect(Route.path.path).toBe("/some/path")
      expect(Route.path.keys).toEqual([])
      expect(Route.path.re instanceof RegExp).toBe(true)

      Route.handler({ blAh: 4 }).then((result) => {
        expect(result.body).toBe(4)
        done()
      })
    })

    it("accepts an undefined route body", (done) => {
      let r = routes.verb("get", "/")
      r = routes.compile.apply(undefined, r)
      //expect(r.args).toEqual([])
      //expect(r.body).toBe(undefined)
      r.handler().then((result) => {
        expect(result).toBe(undefined)
      })

      r = routes.verb("get", "/", undefined, undefined)
      r = routes.compile.apply(undefined, r)
      //expect(r.args).toEqual([])
      //expect(r.body).toBe(undefined)
      r.handler().then((result) => {
        expect(result).toBe(undefined)
      })


      r = routes.verb("get", "/", undefined)
      r = routes.compile.apply(undefined, r)
      //expect(r.args).toEqual([])
      //expect(r.body).toBe(undefined)
      r.handler().then((result) => {
        expect(result).toBe(undefined)
        done()
      })
    })

    it("throws when route body is a empty values of different types", () => {
      expect(() => {
        routes.compile("method", "path", [], null)
      }).toThrowError(/body of a route cannot be/)

      expect(() => {
        routes.compile("method", "path", [], "")
      }).toThrowError(/body of a route cannot be/)
    })

    it("if args is passed, but body is undefined, assumes args is body", (done) => {
      let r = routes.verb("get", "/", "hello")
      r = routes.compile.apply(undefined, r)
      //expect(r.args).toEqual([])
      //expect(r.body).toBe("hello")
      r.handler().then((result) => {
        expect(result.body).toBe("hello")
        done()
      })
    })

    it("throws if non-function body but has args", () => {
      expect(() => {
        const r = routes.verb("get", "/", ["blah"], "test")
        routes.compile.apply(undefined, r)
      }).toThrowError(/arguments would never/)
      expect(() => {
        const r = routes.verb("get", "/1", ["blah"], { a: 1 })
        routes.compile.apply(undefined, r)
      }).toThrowError(/arguments would never/)
      expect(() => {
        const r = routes.verb("get", "/2", ["blah"], [1, 2])
        routes.compile.apply(undefined, r)
      }).toThrowError(/arguments would never/)
    })

    it("the body of a Route can be any value except...", () => {
      // ok
      const ok = ["ok", () => {}, 0, [1,2], {a: 1, b: 2}]
      ok.forEach((v) => {
        routes.compile.bind(null, ["get", "/", [], v])
      })
      // not ok
      const invalid = ["", [], {}, null, undefined]
      invalid.forEach((inv) => {
        expect(routes.compile.bind(null, ["get", "/", [], inv])).toThrow()
      })
    })

    it("accepts regexp or string for path argument", () => {
      routes.compile("method", "string", [], "body")
      routes.compile("method", /regexp/, [], "body")
      routes.compile("method", new RegExp(/abc/), [], "body")

      // path -> array
      let path = ["method", [1,2,3], [], "body"]
      expect(routes.compile.bind(null, ...path)).toThrowError(/compile route/)
      // path -> null
      path[1] = null
      expect(routes.compile.bind(null, ...path)).toThrowError(/compile route/)
      // path -> non regexp object
      path[1] = {}
      expect(routes.compile.bind(null, ...path)).toThrowError(/compile route/)
    })

    const expect_compile_err = (invalid) => {
      const valid = ["string", "string", ["array"], ()=>{}]
      invalid.forEach((inv, idx) => {
        const tmp_valid = valid.slice()
        tmp_valid[idx] = inv
        expect(routes.compile.bind(null, ...tmp_valid)).toThrowError(/compile route/)
      })
    }

    it("throws for invalid type arguments", () => {
      // some invalid arguments to compile
      expect_compile_err([123, 123, "a"])
    })

    it("throws for empty arguments", () => {
      // can only test for first 2 arguments
      expect_compile_err(["", ""])
    })
  })


  describe("decompile", () => {
    it("converts a Route and matched regexp of it's path to a map", () => {
      // paths match but there's nothing to extract
      let Route = routes.compile("get", "/path", ["a"], ()=>{})
      let r = routes.decompile(Route, Route.path.re.exec("/path"))
      expect(r).toEqual(undefined)

      // paths don't match so nothing interesting happens
      Route = routes.compile("get", "/ok/:path", ["a"], ()=>{})
      r = routes.decompile(Route, Route.path.re.exec("/path"))
      expect(r).toEqual(undefined)

      // there's :path but no a
      Route = routes.compile("get", "/ok/:path", ["path", "a"], ()=>{})
      r = routes.decompile(Route, Route.path.re.exec("/ok/123hi"))
      expect(r).toEqual({
        path: "123hi"
      })

      // 'a', and 'no_match' don't work here
      Route = routes.compile("get", "/:super/:duper/:test", ["a", "super", "duper", "test", "no_match"], ()=>{})
      r = routes.decompile(Route, Route.path.re.exec("/a/b/c/"))
      expect(r).toEqual({
        super: "a",
        duper: "b",
        test: "c"
      })
    })
  })

})
