const spirit = require("spirit").node
const path = require("path")

/*
 * The purpose of renderables is to allow for a "low-level" way
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
 */
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
    return spirit.response(body)
  },

  "buffer": function(request, body) {
    return spirit.response(body)
      .type("html")
  },

  "null": function(request, body) {
    return spirit.response()
  },

  "file-stream" : function(request, body) {
    return spirit.file_response(body)
  }
}

/**
 * Renders a Response of the return of a route
 * from a matching renderable type
 *
 * If it's already a Response nothing happens.
 * If it's a response map, it is left untouched but
 * converted to a Response.
 *
 * @param {http.Request} req - node http Request object
 * @return {Response}
 */
const render = (req, resp) => {
  if (spirit.utils.is_Response(resp)) {
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
