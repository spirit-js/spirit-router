const {resources, not_found} = require("../lib/resource")

describe("resources", () => {
  it("creates a response with a file's stream as it's body", (done) => {
    const fn = resources("/", {root: "lib/"})
    fn({ url: "/resource.js", method: "get" }, "").then((result) => {
      expect(result.status).toBe(200)
      expect(typeof result.body.pipe).toBe("function")
      expect(result.headers["Content-Type"]).toBe("application/javascript")
      done()
    })
  })

  it("returns undefined (Promise) if there is an error reading the file", (done) => {
    const fn = resources("", {root: "lib"})
    fn({ url: "/resource123.js", method: "get" }, "").then((result) => {
      expect(result).toBe(undefined)
      done()
    })
  })

  it("can pass an optional mime lookup for content type", (done) => {
    const fn = resources("/", {root: "lib/", mime: {".js": "tester"} })
    fn({ url: "/resource.js", method: "get" }, "").then((result) => {
      expect(result.headers["Content-Type"]).toBe("tester")
      done()
    })
  })

  it("the first argument, the mount path is optional", (done) => {
    const fn = resources({root: "lib/"})
    fn({ url: "/resource.js", method: "get" }, "").then((result) => {
      expect(result.status).toBe(200)
      expect(typeof result.body.pipe).toBe("function")
      expect(result.headers["Content-Type"]).toBe("application/javascript")
      done()
    })
  })

  it("the first argument, the mount path (and the prefix) are not considered part of the file path", (done) => {
    const fn = resources("/mount", {root: ""})
    fn({ url: "/a/b/c/mount/lib/resource.js", method: "get" }, "/a/b/c")
      .then((result) => {
        expect(result.status).toBe(200)
        expect(typeof result.body.pipe).toBe("function")
        expect(result.headers["Content-Type"]).toBe("application/javascript")
        done()
      })
  })

})

describe("not_found", () => {
  it("returns a 404 response map with passed in body", () => {
    let fn = not_found("hi")
    let result = fn({})
    expect(result.status).toBe(404)
    expect(result.headers).toEqual({
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": 2
    })
    expect(result.body).toBe("hi")

    fn = not_found()
    result = fn({})
    expect(result.status).toBe(404)
    expect(result.headers).toEqual({})
    expect(result.body).toBe(undefined)
  })
})
