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

const spirit = require("spirit")
const Response = spirit.node.Response
const path = require("path")

const renderables = {
  "object": function(request, body) {
    return new Response(JSON.stringify(body)).type("json")
  },

  "string": function(request, body) {
    const rmap = new Response(body)
    if (body !== "") {
      rmap.type("html")
    }
    return rmap
  },

  "null": function(request, body) {
    return new Response()
  },

  "stream" : function(request, body) {
    const rmap = new Response(body)
    if (body.path) {
      rmap.type(path.extname(body.path))
    }
    return rmap
  },

  "buffer": function(request, body) {
    return new Response(body).type("html")
  }

}

module.exports = renderables

