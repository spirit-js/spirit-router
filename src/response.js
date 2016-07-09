/*
 * rendering responses
 *
 * Has a middleware system in place, mostly meant for developers
 * NOTE could use the same abstraction with define/reducep/mapl
 * for iterating over middlewares, but I don't expect response
 * middlewares to need to handle async/Promise to generate
 * a appropriate response map
 *
 */

const spirit = require("spirit")
const Response = spirit.node.Response
const renderables = require("./render")

const create = (body) => {
  let rmap
  if (spirit.node.response.is_response(body)) {
    rmap = new Response(body.body).statusCode(body.status)
    rmap.headers = body.headers
  } else {
    rmap = new Response(body)
  }
  return rmap
}

/**
 * returns a ResponseMap for a http redirect based
 * on status code and url, default status code is 302
 *
 * moved-permanently 301
 * found 302
 * see-other 303
 * temporary-redirect 307
 * permanent-redirect 308
 *
 * @param {number} status - http status code
 * @param {string} url - url to redirect to
 * @return {ResponseMap}
 */
const redirect = (status, url) => {
  if (!url) {
    url = status
    status = 302
  }

  if (typeof status !== "number" || typeof url !== "string") {
    throw TypeError("invalid arguments to `redirect`, need (number, string) or (string). number is a optional argument for a valid redirect status code, string is required for the URL to redirect")
  }

  return new Response()
    .statusCode(status)
    .location(url)
}

/**
 * a intermediate function that tries to convert `body` into
 * a appropriate response map first before calling `send()`
 *
 * @param {http.Request} req - node http Request object
 * @param {*} body - the result of a route's body function or from a middleware
 */
const render = (req, resp) => {
  if (spirit.node.response.is_Response(resp)) {
    return resp
  }

  if (spirit.node.response.is_response(resp)) {
    return create(resp)
  }

  let t = typeof resp

  // null, array are objects but it makes sense to think of
  // them as distinct from just "object" since they are so common
  if (t === "object") {
    if (resp === null) {
      t = "null"
      //    } else if (Array.isArray(resp)) {
      //      t = "array"
    } else if (Buffer.isBuffer(resp)) {
      t = "buffer"
    } else if (typeof resp.pipe === "function") {
      t = "stream"
    }
  }

  if (typeof renderables[t] === "function") {
    return renderables[t](req, resp)
  }

  // any unknown renderable types such as:
  // boolean, number, function
  // just get packaged as a Response
  return new Response(resp)
}

module.exports = {
  render,
  create,
  redirect
}
