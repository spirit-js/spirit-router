const Response = require("spirit").node.Response
const response_map = require("../lib/response")

describe("response map", () => {

  describe("create", () => {
    it("returns a response map from value", () => {
      const r = response_map.create("hey")
      expect(r).toEqual(jasmine.objectContaining({
        status: 200,
        headers: {},
        body: "hey"
      }))
      expect(r instanceof Response).toBe(true)
    })

    it("returns a response map from {}response map", () => {
      const r = response_map.create({
        status: 123,
        headers: { a: 1 }
      })
      expect(r).toEqual(jasmine.objectContaining({
        status: 123,
        headers: { a: 1 },
        body: ""
      }))
      expect(r instanceof Response).toBe(true)
    })

    // response.response already checks if it's a ResponseMap
    // but if for some reason it's called with one
    // it just creates a new similar one
    it("returns response map if already response map", () => {
      const t = new Response("hi")
      const r = response_map.create(t)
      expect(r instanceof Response).toBe(true)
      expect(r).not.toBe(t)
      expect(r).toEqual(jasmine.objectContaining({
        status: 200,
        headers: {},
        body: "hi"
      }))
    })
  })

  describe("redirect", () => {
    it("generates a response map for redirecting", () => {
      let rmap = response_map.redirect(123, "google")
      expect(rmap).toEqual(jasmine.objectContaining({
        status: 123,
        body: "",
        headers: { "Location": "google" }
      }))
      expect(rmap instanceof Response).toBe(true)

      // defaults status to 302
      rmap = response_map.redirect("blah")
      expect(rmap).toEqual(jasmine.objectContaining({
        status: 302,
        body: "",
        headers: { "Location": "blah" }
      }))
      expect(rmap instanceof Response).toBe(true)
    })

    it("throws an error for invalid arguments", () => {
      const test = (status, url) => {
        expect(() => {
          response_map.redirect(status, url)
        }).toThrowError(/invalid arguments/)
      }

      test(123)
      test("blah", 123)
      test("hi", "blah")
    })
  })

})
