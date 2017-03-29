/*
 * Test for issue #5
 * Mostly for regression, as the issue is related to `spirit`
 */

const {adapter} = require("spirit").node
const routes = require("../index")

describe("regression", () => {

  it("properly handles query strings urls", (done) => {
    let matched = false
    let test

    const handler = adapter(routes.define([
      routes.get("/querystring", ["request"], (request) => {
        matched = true
        test = request
      })
    ]))

    const res = {
      writeHead: () => {},
      write: () => {},
      end: () => {
        expect(matched).toBe(true)
        expect(test.url).toBe("/querystring")
        expect(test.path).toBe("/querystring?a=1&b=2")

        expect(test.query.a).toBe("1")
        expect(test.query.b).toBe("2")
        expect(Object.keys(test.query).length).toBe(2)
        done()
      }
    }
    const req = { url: "/querystring?a=1&b=2", method: "GET" }
    handler(req, res)
  })
})
