/*
 * The following can be done using middleware,
 * but it is different in that they are ran
 * __immediately__ after a route is successful (after it's been
 * converted to a Response). And __before__ flowing back to
 * middleware.
 *
 * The purpose of which is to allow for a low-level way
 * of handling the result of a route that should apply for
 * _all_ instances of the specific type.
 *
 * All the default handling for the types below can be replaced
 * or extended, just as new types can be added.
 *
 * Please keep in mind that all response bodys must eventually
 * be either a string, buffer, stream, or undefined.
 * Otherwise spirit node adapter will not know how to write
 * the response back to the requesting client.
 *
 * That is one of the main goals of the default types below.
 * As well as filling in header values and status code
 * where it makes the most sense.
 */

const spirit = require("spirit").node
const path = require("path")

const renderables = {
  "object": function(request, body) {
    return spirit.response(JSON.stringify(body))
      .type("json")
  },

  "array": function(request, body) {
    return spirit.response(JSON.stringify(body))
      .type("json")
  },

  "string": function(request, body) {
    const rmap = spirit.response(body)
    if (body !== "") {
      rmap.type("html")
    }
    return rmap
  },

  "null": function(request, body) {
    return spirit.response()
  },

  "file-stream" : function(request, body) {
    const rmap = spirit.response(body)
    if (body.path) {
      rmap.type(path.extname(body.path))
    }
    return rmap
  },

  "buffer": function(request, body) {
    return spirit.response(body)
      .type("html")
  }

}

/**
 * a intermediate function that tries to convert `body` into
 * a appropriate response map first before calling `send()`
 *
 * @param {http.Request} req - node http Request object
 * @param {*} body - the result of a route's body function or from a middleware
 */
const render = (req, resp) => {
  if (spirit.is_Response(resp)) {
    return resp
  }

  if (spirit.is_response(resp)) {
    return spirit.response(resp)
  }

  const t = spirit.utils.type_of(resp)

  if (typeof renderables[t] === "function") {
    return renderables[t](req, resp)
  }

  // any unknown renderable types such as:
  // boolean, number, function
  // just get packaged as a Response
  return new spirit.Response(resp)
}

module.exports = {
  renderables,
  render
}
