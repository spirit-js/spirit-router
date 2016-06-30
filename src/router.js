const routes = require("./routes")
const response = require("./response")
const spirit = require("spirit")
const Promise = require("bluebird")

/**
 * sees if there's a match with route `compiled_route` based on
 * the incoming requests method and path
 *
 * @param {Route} route - a Route (from routes.compile)
 * @param {string} req_method - the incoming request method
 * @param {string} req_path - the incoming request's url
 * @return {array}
 */
const _lookup = (route, req_method, req_path) => {
  if (route.method.toLowerCase() === req_method.toLowerCase()) {
    const params = route.path.re.exec(req_path)
    if (params) {
      return params
    }
  }
  return undefined
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

    // if arg is an array, do not assume lookup
    // return it directly
    if (Array.isArray(arg)) {
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
      if (p === "") {
        o = obj
      }
      v = lookup(arg, o)
      return (typeof v !== "undefined")
    })
    return v
  })
}

/**
 * wraps a Route with router logic
 * If the routing passes, it sets the params on
 * the request map
 *
 * And then calls and returns the Route function
 *
 * @param {Route} Route - a Route
 * @return {function}
 */
const router = (arr_routes) => {
  arr_routes = arr_routes.map(function(r) {
    return poop.bind(undefined, r)
  })

  return function(request) {
    const pp = Promise.resolve()
    return arr_routes.reduce(function(p, fn) {
      return p.then(function(v) {
        if (typeof v !== "undefined") {
          return v // if there is a value, stop iterating
        }
        return fn.call(undefined, request)
      })
    }, pp)
  }
}

const poop = (Route, request) => {
  //const url = request.url.substring(Route.prefix.length)
  const params = _lookup(Route, request.method, request.url)
  if (params) {
    request.params = routes.decompile(Route, params)
    //return spirit.compose(route_handler(Route.body, Route.args), Route.middleware)(request)
    return spirit.utils.resolve_response(spirit.utils.callp(Route.body, _destructure(Route.args, request))).then((resp) => {
      if (typeof resp !== "undefined") {
        return response.response(request, resp)
      }
      return resp
    })
  }
  return undefined
}

const route_handler = (fn, args, request) => {
    const r = spirit.utils.callp(fn, _destructure(args, request))
    return spirit.utils.resolve_response(r).then((resp) => {
      if (typeof resp !== "undefined") {
        return response.response(request, resp)
      }
      return resp
    })
}

/**
 * Iterate over an array of wrapped Routes
 * Stopping when a result is returned by a Route
 *
 * @param {array} arr - an array of wrapped Routes
 * @param {request-map} request - request map
 * @return {Promise} a promise of the result of a Route
 */
const reduce_r = (arr, request) => {
  return arr.reduce((p, fn) => {
    return p.then(function(v) {
      if (typeof v !== "undefined") {
        return v // if there is a value, stop iterating
      }
      return fn.call(undefined, request)
    })
  }, Promise.resolve())
}

const compile_and_prefix = (_route, prefix) => {
  if (Array.isArray(_route)) {
    _route.forEach((r) => {
      compile_and_prefix(r, prefix)
    })
    return _route
  }
  _route.prefix = prefix + _route.prefix
  return _route
}

/**
 * Returns a spirit handler
 *
 * The handler reduces over `arr_routes`, compiling
 * each element in `arr_routes` to be a Route.
 * And wrapping each Route with a spirit handler
 * that acts as a router
 *
 * The `named` paramter is used for routing
 * It is matched against the prefix of a URL
 *
 * @public
 * @param {string} named - optional prefix to match
 * @param {*} routes - a route, or array of routes or compiled route(s)
 * @return {function} wrapped_route_handler
 */
const define = (named, arr_routes) => {
  if (typeof arr_routes === "undefined") {
    arr_routes = named
    named = ""
  }

  const compile_and_wrap = arr_routes.map((_route) => {
    if (typeof _route[0] === "string") {
      return routes.compile.apply(undefined, _route)
    }
    return compile_and_prefix(_route, named)
  })

  return compile_and_wrap.reduce((a, b) => {
    return a.concat(b)
  }, [])
/*
  return function(request, prefix, middleware) {
    if (!middleware) middleware = []
    if (typeof prefix !== "string") prefix = ""
    prefix = prefix + named

    if (request.url.indexOf(prefix) === 0) {
      const handler = (req) => {
        return reduce_r(compile_and_wrap, req, prefix)
      }
      return spirit.compose(handler, middleware)(request)
    }
  }
 */
}

/**
 * wraps a Route or a routing function
 * to have middleware associated with it
 *
 * @public
 * @param {Route|function} route - either a Route or a routing function (returned by define)
 * @param {array} middleware - an array of middleware functions
 * @return {function} the original `route` wrapped with middleware
 */
const wrap = (route, middleware) => {
  if (typeof route !== "function") {
    route = router(routes.compile.apply(undefined, route))
  }

  if (!Array.isArray(middleware)) {
    if (typeof middleware !== "function") {
      throw new TypeError("Expected `wrap` to be called with a middleware(function) or an array of middleware")
    }
    middleware = [middleware]
  }

  return (request, prefix) => {
    return route(request, prefix, middleware)
  }
}

module.exports = {
  _destructure,
  _lookup,
  define, // public
  reduce_r,
  route_handler,
  wrap,   // public
  router
}
