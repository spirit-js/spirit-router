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
const response = (req, body) => {
  let rmap = body
  if (spirit.node.response.is_Response(body)) {
    return render(req, rmap, middlewares.list())
  } else if (spirit.node.response.is_response(body)) {
    return rmap
  } else {
    rmap = create(body)
    return render(req, rmap, middlewares.list())
  }
}

// response middleware; sets a default html & utf-8 charset
// when no content type headers are set for a response with
// a string body
const render_string = (req, resp) => {
  const {body} = resp
  if (typeof body === "string" && body !== "") {
    return resp._type("html")
  }
}

// response middleware; converts all numbers to be a string
// then sets the content type to be html & utf-8 if there
// is no content-type set
const render_number = (req, resp) => {
  const {body} = resp
  if (typeof body === "number") {
    resp.body = resp.body.toString()
    return render_string(req, resp)
  }
}

// TODO
const render_buffer = (req, resp) => {
  const {body} = resp
  if (Buffer.isBuffer(body)) {
    return resp._type("html")
  }
}

module.exports = {
  response,
  create,
  redirect
}
