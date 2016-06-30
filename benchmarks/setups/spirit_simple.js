const spirit = require("spirit")
const {route, define} = require("../../index")

const app = route.define([
  route.get("/", [], "Hello World")
])

const site = spirit.node.adapter(app, [])

const http = require("http")
http.createServer(site).listen(3009)
