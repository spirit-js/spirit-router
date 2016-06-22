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

  it("does dep injection (destructures) the input (request) for routes")
})
