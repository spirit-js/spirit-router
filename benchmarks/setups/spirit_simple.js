const spirit = require("spirit").node
const route = require("../../index") // spirit-router

const app = route.define([
  route.get("/", "Hello World")
])

const site = spirit.adapter(app)

const http = require("http")
http.createServer(site).listen(3009)
