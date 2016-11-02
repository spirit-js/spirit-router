const fs = require("fs")
const {response, file_response} = require("spirit").node
const Promise = require("bluebird")
const path = require("path")
const render = require("./render").render

const resources = (mount_path="", opts={}) => {
  if (typeof mount_path === "object") {
    opts = mount_path
    mount_path = ""
  }
  if (opts.root === undefined) opts.root = "public/"
  if (opts.root !== "" && opts.root[opts.root.length] !== "/") opts.root = opts.root + "/"
  if (typeof opts.mime !== "object") opts.mime = {}

  return (request, prefix) => {
    if (request.method !== "GET") {
      return undefined
    }

    const mount_pt = prefix + mount_path
    if (request.url.indexOf(mount_pt) !== 0) {
      return undefined
    }

    // remove the prefix + mount_path from the request url
    // to get the correct file path
    // additionally, remove any beginning "/"
    let idx = mount_pt.length
    if (request.url[idx] === "/") idx += 1
    const fp = opts.root + request.url.slice(idx)
    const opt_ext = opts.mime[path.extname(fp)]

    return file_response(fp)
      .then((resp) => {
        if (opt_ext) resp.type(opt_ext)
        return resp
      })
      .catch((err) => {
        // the error doesn't matter too much,
        // but catch to surpress and "pass" on this route
        return undefined
      })
  }
}

/**
 * Convienance route for always returning a 404 response
 *
 * @param {string} method - optional, match only for method, otherwise matches all methods
 * @param {*} body - valid response body
 * @returns {function} function that always returns a 404 of the `body` if `method` matches
 */
const not_found = (method, body) => {
  if (!body) {
    body = method
    method = "*"
  } else {
    method = method.toUpperCase()
  }

  return (request) => {
    if (method === "*" || request.method === method) {
      return render(request, body).status_(404)
    }
  }
}

module.exports = {
  resources,
  not_found
}
