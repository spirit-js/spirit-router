const {resources, not_found} = require("../lib/resource")

describe("resources", () => {

  // tests the response map of 'resource.js' file
  // used in multiple tests
  const test_file_response = (result) => {
    expect(result.status).toBe(200)
    expect(typeof result.body.pipe).toBe("function")
    expect(result.body.path).toMatch(/resource.js/)

    expect(Object.keys(result.headers).length).toBe(3)
    expect(result.headers["Content-Type"]).toBe("application/javascript")
    expect(result.headers["Content-Length"]).toBeGreaterThan(1500)
    expect(result.headers["Last-Modified"]).not.toBe(undefined)
  }

  it("creates a response with a file's stream as it's body", (done) => {
    const fn = resources("/", {root: "lib/"})
    fn({ url: "/resource.js", method: "GET" }, "").then((result) => {
      test_file_response(result)
      done()
    })
  })

  it("returns undefined (Promise) if there is an error reading the file", (done) => {
    const fn = resources("", {root: "lib"})
    fn({ url: "/resource123.js", method: "GET" }, "").then((result) => {
      expect(result).toBe(undefined)
      done()
    })
  })

  it("the root option is always assumed to be a dir, and a trailing '/' is always added", (done) => {
    const fn = resources("/", {root: "lib"})
    fn({ url: "/resource.js", method: "GET" }, "").then((result) => {
      test_file_response(result)
      done()
    })
  })

  it("can pass an optional mime lookup for content type", (done) => {
    const fn = resources("/", {root: "lib/", mime: {".js": "tester"} })
    fn({ url: "/resource.js", method: "GET" }, "").then((result) => {
      expect(result.headers["Content-Type"]).toBe("tester")
      done()
    })
  })

  it("the first argument, the mount path is optional", (done) => {
    const fn = resources({root: "lib/"})
    fn({ url: "/resource.js", method: "GET" }, "").then((result) => {
      test_file_response(result)
      done()
    })
  })

  it("the first argument, the mount path (and the prefix) are not considered part of the file path, as well as any trailing '/' is ignored too", (done) => {
    const fn = resources("/mount/", {root: ""})
    fn({ url: "/a/b/c/mount/lib/resource.js", method: "GET" }, "/a/b/c")
      .then((result) => {
        test_file_response(result)
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
