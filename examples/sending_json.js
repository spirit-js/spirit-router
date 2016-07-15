const {adapter, response} = require("spirit").node
const route = require("../index")
const http = require("http")

// returning just a object, json is assumed
const json_example = () => {
  return { name: "json", status: "example" }
}

// or, as with everything else, if you want more control
// you can return a response
const json_example2 = () => {
  // get the same object from the above example ;)
  const json = json_example()

  // response() doesn't assume anything, so we need to
  // convert it to JSON and set the appropriate Content-Type
  return response(JSON.stringify(json)).type("json")
}

const app = route.define([
  route.get("/", [], json_example),
  route.get("/2", [], json_example2)
])

http.createServer(adapter(app)).listen(3000)
