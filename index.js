var router = require("./lib/router")
var routes = require("./lib/routes")
var render = require("./lib/render")

var exports = routes.verbs
exports.method = routes.verb

exports.define = router.define
exports.wrap = router.wrap

exports.render = render.renderables

var resource = require("./lib/resource")
exports.not_found = exports.notFound = resource.not_found
exports.resources = resource.resources

module.exports = exports
