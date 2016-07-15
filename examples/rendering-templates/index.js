const spirit = require("spirit")
const routes = require("../../index")

const http = require("http")
const jade = require("jade")

const cache = {}
// a very simple example of how to render jade templates
// since template engines already provide a means to
// compile templates, all that's really needed is
// to write a function that is generic and caches templates
const render = (file, local) => {
  file = __dirname + "/" + file
  let f = cache[file]
  if (!f) {
    f = cache[file] = jade.compileFile(file)
  }
  return f(local)
}

const index = () => {
  return render("test.jade", { name: "spirit with jade!" })
}

const app = routes.define([
  routes.get("/", [], index)
])

const server = http.createServer(spirit.node.adapter(app))
server.listen(3000)
