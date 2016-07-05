/*
 * For Routes, HTTP method shortcuts and converting to a structure for router.lookup
 */

const path_regexp = require("path-to-regexp")

/**
 * converts a route definition to something more friendly for
 * router.lookup
 *
 * returns a Route, which is just a map
 *
 * The `body` can be of any type or a function that returns
 * just about any type as long as `core.response` knows
 * how to render it
 *
 * It is simpler here to type check `body` for things that do
 * not make sense at all. As a stringent type check is hard to do
 * especially without running the function / function
 * returns a promise
 *
 * @param {string} method - http verb
 * @param {string} path - URL path of route
 * @param {string[]} args - arguments used to destructure the request, and to be passed into `body`
 * @param {function} body - a function that accepts args
 * @return {Route}
 */
const compile = (method, path, args, body) => {
  const route_err = " [Method: " + method + ", Path: " + path + "]"

  // guard
  if (typeof method !== "string"
      || typeof path !== "string"
      || (!Array.isArray(args) && typeof args !== "undefined")) {
    throw new TypeError("Cannot compile route, invalid argument type to compile: " + typeof method + ", " + typeof path + ", " + typeof args + ", Expecting type: (string, string, array, *)")
  }
  if (body === null
      || body === ""
      || (typeof body === "object" && Object.keys(body).length === 0)) {
        throw new TypeError("The body of a route cannot be an empty value." + route_err)
      }
  // guard
  if (!method || !path) {
    throw new Error("Cannot compile route, empty string passed." + route_err)
  }

  if (typeof args === "undefined") {
    args = []
  }

  if (args.length && typeof body === "undefined") {
    throw new Error("Cannot compile route with arguments but an body that is undefined. The arguments would never be used." + route_err)
  }

  const keys = []
  const re = path_regexp(path, keys)

  return {
    method: method.toLowerCase(),
    path: { re, keys, path },
    args,
    body
  }
}

/**
 * converts a Route to a map of it's keys and values as matched
 * by Route.path.re to it's Route.path.keys
 *
 * @param {Route} route - a Route
 * @param {RegExp} regexp_params - result of Route's matched regexp
 * @return {object|undefined}
 */
const decompile = (route, regex_params) => {
  // regex_params is probably null because
  // Route.path.re.exec didn't match anything
  if (regex_params === null || regex_params.length < 2) {
    return undefined
  }

  const params = {}
  regex_params.forEach((param, idx) => {
    if (idx) { // ignore 0 index
      const key = route.path.keys[idx - 1]
      params[key.name] = param
    }
  })

  return params
}

/*
 * The following are just "helper" functions to convert
 * a set of arguments into a array that can then be used
 * for compiling
 */
const verb = (method, path, args, body) => {
  return [method, path, args, body]
}

// used for exporting some common http verbs
const verbs = {}

const http_methods = [
  "get", "put", "post", "delete", "head"
]

http_methods.forEach((method) => {
  verbs[method] = verb.bind(null, method)
})

module.exports = {
  verb,
  verbs,
  compile,
  decompile
}
