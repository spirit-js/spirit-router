const {adapter} = require("spirit").node
const route = require("../../index")
const defaults = require("spirit-common").defaults


const hello = () => {
  return "Hello World"
}

const app = route.define([
  route.get("/", [], hello),
])


const site = adapter(app, [defaults("site")])

const http = require("http")
http.createServer(site).listen(3009)

