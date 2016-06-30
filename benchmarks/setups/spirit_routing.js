const spirit = require("spirit")
const router = require("../../index")
const route = router.route
const _router = router.router

const admin_index = () => {
  return "admin index"
}

const admin = route.define("/admin", [
  route.get("/", [], admin_index)
])

const app = route.define([
  route.get("/a", [], "no"),
  route.get("/b", [], "no"),
  route.get("/c", [], "no"),
  route.get("/d", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/a", [], "no"),
  route.get("/", [], "Hello World"),
  //admin,
  //routes.wrap(admin, [])
])

const site = spirit.node.adapter(_router(app), [])

const http = require("http")
http.createServer(site).listen(3009)
