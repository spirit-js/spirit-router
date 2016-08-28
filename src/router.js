const Promise = require("bluebird")
const routes = require("./routes")
const spirit = require("spirit")

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
  if (route.method === req_method || route.method === "*") {
    const params = route.path.re.exec(req_path)
    if (params) {
      return params
    }
  }
}

/**
 * Wraps `Route` with a routing function
 * If the match fails, it simply returns undefined
 * If it succeeds, it will call and return Route's handler
 *
 * @param {Route} Route - a Route
 * @return {function} router that wraps over a Route
 */
const wrap_router = (Route) => {
  return (request, prefix) => {
    if (typeof prefix !== "string") prefix = ""
    const url = request.url.substring(prefix.length)
    const params = _lookup(Route, request.method, url)
    if (!params) {
      return undefined
    }
    request.params = routes.decompile(Route, params)
    return Route.handler(request)
  }
}

const wrap_context_router = (handler, name) => {
  return (request, prefix) => {
    if (typeof prefix !== "string") prefix = ""
    prefix = prefix + name

    if (request.url.indexOf(prefix) === 0) {
      return handler(request, prefix)
    }
  }
}

/**
 * Iterate over an array of wrapped Routes
 * Stopping when a result is returned by a Route
 *
 * @param {array} arr - an array of wrapped Routes
 * @return {Promise} a promise of the result of a Route
 */
const reduce_r = (arr) => {
  return (request, prefix) => {
    // NOTE
    //if (arr.length === 1) return arr[0](request, prefix)

    let p = Promise.resolve()
    for (let i = 0; i < arr.length; i++) {
      p = p.then((v) => {
        if (typeof v !== "undefined") {
          return v // if there is a value, stop iterating
        }
        return arr[i](request, prefix)
      })
    }
    return p
  }
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

  if (!Array.isArray(arr_routes)) {
    throw new TypeError("Expected `define` to be called with an array (of routes)")
  }

  arr_routes = arr_routes.slice()

  const compile_routes = arr_routes.map((_route) => {
    if (typeof _route === "function") return _route
    return wrap_router(routes.compile.apply(undefined, _route))
  })


  const handler = reduce_r(compile_routes)
  const router_and_handle = wrap_context_router(handler, named)

  return (request, prefix, handler_only) => {
    if (handler_only === true) return [handler, named]

    return router_and_handle(request, prefix)
  }
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
  if (!Array.isArray(middleware)) {
    if (typeof middleware !== "function") {
      throw new TypeError("Expected `wrap` to be called with a middleware(function) or an array of middleware")
    }
    middleware = [middleware]
  } else {
    middleware = middleware.slice()
  }

  // wrapping a route
  if (typeof route !== "function") {
    const Route = routes.compile.apply(undefined, route)
    Route.handler = spirit.compose(Route.handler, middleware)
    return wrap_router(Route)
  }

  // otherwise wrapping a function (from define)
  const err_msg = "Unable to apply middlewares to route, route being passed to `wrap` does not take middlewares."
  if (route.length !== 3) throw new Error(err_msg)
  const r = route(undefined, undefined, true)
  if (typeof r[0] !== "function" || typeof r[1] !== "string") throw new Error(err_msg)
  return wrap_context_router(compose_args(r[0], middleware), r[1], "_routing")
}

/**
 * Like `spirit.compose` but injects a final middleware
 * and wraps the initial function
 *
 * The initial function will save it's arguments on the request
 * The final injected middleware will clean up the initial func
 * And call `handler` with the initial arguments to the
 * initial function
 *
 * The main purpose of this is to maintain handler (router)
 * arguments when the handler is wrapped with middleware
 *
 * @param {function} handler final handler function
 * @param {array} middleware an array of middleware functions
 * @param {string} prop_name  property name to set on the first argument (request), defaults to "_tmp"
 * @return {function} function that calls middleware and handler
 */
const compose_args = (handler, middleware, prop_name) => {
  prop_name = prop_name || "_tmp"

  const cleanup = (handler) => {
    return (obj) => {
      if (typeof obj !== "object" || obj[prop_name] === undefined) {
        throw new TypeError("(compose_args) The first argument was changed unexpectedly, (ex: request doesn't exist or has been structurally altered in an unrecoverable way)")
      }

      // clean up and inject
      const args = obj[prop_name]
      delete obj[prop_name]
      args.unshift(obj)
      return handler.apply(undefined, args)
    }
  }

  middleware.push(cleanup)
  const fn = spirit.compose(handler, middleware)

  return function(obj) {
    if (typeof obj !== "object") {
      throw TypeError("(compose_args) Expected first argument to be an object (ex: request)")
    }
    // init
    const args = Array.prototype.slice.call(arguments)
    obj[prop_name] = args.slice(1)
    return fn.apply(undefined, args)
  }
}

module.exports = {
  _lookup,
  define, // public
  reduce_r,
  wrap,   // public
  wrap_router,
  compose_args
}
