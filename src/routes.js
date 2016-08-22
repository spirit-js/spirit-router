/*
 * For Routes, HTTP method shortcuts
 */

const path_regexp = require("path-to-regexp")

/**
 * converts a route definition to something more friendly
 * to deal with. As well as `path` is converted to a regexp
 *
 * returns a Route, which is just a map
 *
 * The `body` can be of any type or a function that returns
 * just about any type as long as `render` knows
 * how to render it, or it is a valid response map.
 *
 * Type checks are done where types do not make sense.
 *
 * `args` and `body` are both optional. If only one of them is
 * provided, then `body` is assumed as there would be not point
 * to specify `args` with no `body.`
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

  if (args === undefined) {
    args = []
  }

  if (args.length && typeof body !== "function") {
    throw new Error("Cannot compile route with arguments but an body that is undefined. The arguments would never be used." + route_err)
  }

  const keys = []
  const re = path_regexp(path, keys)

  return {
    method: method.toUpperCase(),
    path: { re, keys, path },
    handler: make_handler(body, args)
  }
}

/**
 * Destructures against `obj` the keys of `args`
 * Prioritizes `obj`.params then `obj` when look up
 *
 * Returns an array of values ordered the same way as `args`
 *
 * @param {string[]} args - a string of keys to destructure in `obj`
 * @param {object} obj - a map
 * @return {*[]}
 */
const _destructure = (args, obj) => {
  function lookup(k, o) {
    if (typeof o === "undefined") {
      return undefined
    }
    return o[k]
  }

  return args.map((arg) => {
    let v

    // if arg is an array, do not assume / search
    // return it directly
    if (Array.isArray(arg)) {
      if (arg[0] === "request") return obj
      if (arg[0] === "req" && typeof obj["req"] === "function") return obj.req()

      v = lookup(arg[0], obj)
      if (arg.length === 1) {
        return v
      }
      return v[arg[1]]
    }

    // otherwise make assumptions of where to look
    // prioritizing certain keys
    const priority = ["params", ""] // "" means root of obj
    // return the first thing that's not undefined
    priority.some((p, i) => {
      let o = obj[p]
      if (p === "") { // root obj
        if (arg === "request") {
          v = obj
          return true // if root obj & "request" exit loop
        }
        o = obj
      }
      v = lookup(arg, o)
      return (typeof v !== "undefined")
    })

    if (arg === "req" && typeof v === "function") {
      return v()
    }
    return v
  })
}

const spirit = require("spirit")
const render = require("./render").render
const make_handler = (body, args) => {
  return (request) => {
    const r = spirit.callp(body, _destructure(args, request))
    return spirit.node.utils.resolve_response(r).then((resp) => {
      if (typeof resp !== "undefined") {
        return render(request, resp)
      }
      return resp
    })
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

const verb = (method, path, args, body) => {
  if (body === undefined) {
    body = args
    args = undefined
  }
  return [method, path, args, body]
}

/*
 * The following are just "helper" functions to convert
 * a set of arguments into a array that can then be used
 * for compiling
 */
const verbs = {}
const http_methods = [
  "get", "put", "post", "delete", "head", "options", "patch"
]
http_methods.forEach((method) => {
  verbs[method] = verb.bind(null, method)
})
verbs.any = verb.bind(null, "*")

module.exports = {
  verb,
  verbs,
  compile,
  decompile,
  make_handler,
  _destructure
}
