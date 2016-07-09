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

const renderables = {
  "undefined": function(request, response) {
    
  },
  "object": function() {
    
  },
  "array": function() {
    
  },
  "string": function() {
    
  },
  "null": function() {
    
  }
}

const render = (req, resp, renderables) => {
  // boolean, number, function are unknown what to do with
  let t = typeof resp.body

  // null, array are objects but it makes sense to think of
  // them as distinct from just "object" since they are so common
  if (t === "object") {
    if (t === null) {
      t = "null"
    } else if (Array.isArray(t)) {
      t = "array"
    }
  }

  if (renderables[t]) {
    return renderables[t](req, resp)
  }
  return resp
}

module.exports = {
  renderables,
  render
}

