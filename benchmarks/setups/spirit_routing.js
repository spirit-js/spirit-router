const spirit = require("spirit")
const route = require("../../index") // spirit-router

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
  route.get("/", [], "Hello World")
])

const site = spirit.node.adapter(app)

const http = require("http")
http.createServer(site).listen(3009)
