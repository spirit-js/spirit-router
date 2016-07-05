/*
 * spec for how spirit-router works
 */

const router = require("../index")

describe("router-spec", () => {

  const route = router.route

  it("it is a spirit handler, takes a request, returns a Promise of a response map", (done) => {
    const r = route.define([
      ["get", "/", [], "home"]
    ])
    const result = r({ method: "get", url: "/"})
    result.then((response) => {
      expect(response).toEqual(jasmine.objectContaining({
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        },
        body: "home"
      }))
      done()
    })
  })

  it("routes based on request map's url and method", (done) => {
    const r = route.define([
      ["get", "/", [], "get home"],
      ["post", "/", [], "post home"],
      ["post", "/a", [], "post a"],
      ["get", "/a", [], "get a"]
    ])

    const result = r({ method: "post", url: "/a" })
    result.then((resp) => {
      expect(resp).toEqual(jasmine.objectContaining({
        status: 200,
        body: "post a"
      }))
      done()
    })
  })

  it("can compose by nesting itself", (done) => {
    const rrr = route.define([
      ["get", "/", [], "home"]
    ])
    const rr = route.define([ rrr ])
    const r = route.define([ rr ])

    const result = r({ method: "get", url: "/" })
    result.then((resp) => {
      expect(resp).toEqual(jasmine.objectContaining({
        status: 200,
        body: "home"
      }))
      done()
    })
  })

  it("stops routing after it gets a response", (done) => {
    const r = route.define([
      ["get", "/", [], "ok"],
      ["get", "/", [], "oops"]
    ])

    const result = r({ method: "get", url: "/" })
    result.then((resp) => {
      expect(resp.body).toBe("ok")
      done()
    })
  })

  it("can specify a prefix used for routing (with define)", (done) => {
    const route_b = route.define("/b", [
      ["get", "/b", [], "b"]
    ])
    const route_a = route.define("/a", [
      ["get", "/a", [], "a"]
    ])

    const result = route_a({ method: "get", url: "/a/a" })
    result.then((resp) => {
      expect(resp.body).toBe("a")
      return route_b({ method: "get", url: "/b/b" })
    }).then((resp) => {
      expect(resp.body).toBe("b")
      done()
    })
  })

  it("the prefix when nested will carry over", (done) => {
    const route_b = route.define("/b", [
      ["get", "/b", [], "b"]
    ])
    const route_a = route.define("/a", [
      ["get", "/a", [], "a"],
      route_b
    ])

    const result = route_a({ method: "get", url: "/a/b/b" })
    result.then((resp) => {
      expect(resp.body).toBe("b")
      done()
    })
  })

  it("does dep injection by destructuring the input (request) for routes", (done) => {
    const test = (arg) => {
      expect(arg).toBe("/a/a")
      return arg
    }
    const r = route.define("/a", [
      ["get", "/a", ["url"], test]
    ])

    const result = r({ method: "get", url: "/a/a" })
    result.then((resp) => {
      expect(resp.body).toBe("/a/a")
      done()
    })
  })

  it("can 'pass' on a route by returning undefined, moving to the next route that matches", (done) => {
    const test = () => {}
    const hi = () => { return "hi" }

    const r = route.define([
      ["get", "/a", [], test],
      ["get", "/a", [], test],
      ["get", "/a", [], hi],
      ["get", "/a", [], "no"]
    ])

    const result = r({ method: "get", url: "/a" })
    result.then((resp) => {
      expect(resp.body).toBe("hi")
      done()
    })
  })

  it("converts return values of a Route or a Routes function to be a promise response map", (done) => {
    const test = () => {
      return "hello world"
    }
   const r = route.define([
      ["get", "/", [], test],
      ["get", "/string", [], "hello world!"]
    ])

    const result = r({ method: "get", url: "/" })
    result.then((resp) => {
      expect(resp).toEqual(jasmine.objectContaining({
        status: 200,
        body: "hello world"
      }))
      return r({ method: "get", url: "/string" })
    }).then((resp) => {
      expect(resp).toEqual(jasmine.objectContaining({
        status: 200,
        body: "hello world!"
      }))
      done()
    })
  })

  it("'params' does not leak into other routes", (done) => {
    const test = (arg) => {
      expect(arg).toBe("test")
    }
    const test2 = (arg) => {
      expect(arg).toBe("/test")
      return arg
    }
    const r = route.define([
      ["get", "/:url", ["url"], test],
      ["get", "/test", ["url"], test2]
    ])

    const result = r({ method: "get", url: "/test" })
    result.then((resp) => {
      done()
    })
  })

  it("can wrap spirit middleware with a Route", (done) => {
    const test = (called) => {
      expect(called).toBe("21")
      return "123"
    }

    const middleware = [
      (handler) => {
        return (request) => {
          request.called += "2"
          return handler(request).then((resp) => {
            expect(resp.body).toBe("123b")
            resp.body += "a"
            return resp
          })
        }
      },
      (handler) => {
        return (request) => {
          request.called += "1"
          return handler(request).then((resp) => {
            resp.body += "b"
            return resp
          })
        }
      }
    ]

    const r = route.define([
      router.route.wrap(["get", "/", ["called"], test], middleware)
    ])

    const result = r({ method: "get", url: "/", called: "" })
    result.then((resp) => {
      expect(resp.body).toBe("123ba")
      done()
    })
  })

  it("can wrap the result of define with middleware", (done) => {
    const test = (called) => {
      expect(called).toBe("2121")
      return "123"
    }

    const middleware = [
      (handler) => {
        return (request) => {
          request.called += "2"
          return handler(request).then((resp) => {
            resp.body += "a"
            return resp
          })
        }
      },
      (handler) => {
        return (request) => {
          request.called += "1"
          return handler(request).then((resp) => {
            resp.body += "b"
            return resp
          })
        }
      }
    ]

    let r = route.define([
      router.route.wrap(["get", "/", ["called"], test], middleware)
    ])

    const rr = router.route.wrap(r, middleware)
    const result = rr({ method: "get", url: "/", called: "" })
    result.then((resp) => {
      expect(resp.body).toBe("123baba")
      done()
    })
  })

  it("routes with no body get routed (middleware gets called), but the route is considered a pass as the route's body is undefined", (done) => {
    const middleware = (handler) => {
      return (request) => {
        return handler(request).then((resp) => {
          expect(resp).toBe(undefined)
          return "ok"
        })
      }
    }
    let r = route.define([
      router.route.wrap(router.route.get("/"), middleware),
      router.route.get("/", [], "hello")
    ])

    r({ method: "get", url: "/" }).then((resp) => {
      expect(resp).toBe("ok")

      // same test but without middleware
      r = route.define([
        router.route.get("/"),
        router.route.get("/", [], "hello")
      ])
      r({ method: "get", url: "/" }).then((resp) => {
        expect(resp.body).toBe("hello")
        done()
      })
    })
  })
})
