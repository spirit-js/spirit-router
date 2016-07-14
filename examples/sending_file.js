const {file_response, adapter} = require("spirit").node
const {route} = require("../index")
const http = require("http")

const Promise = require("bluebird")
const fs = Promise.promisifyAll(require("fs"), { suffix: "Promise" });

// with file_response
const response_example = () => {
  return file_response(__dirname + "/test-file.html")
}

// with fs.readFile
// NOTE that there is a difference between the two
// in this example it doesn't set "Last-Modified" headers
const readFile_example = () => {
  return fs.readFilePromise(__dirname + "/test-file.html")
}

const app = route.define([
  route.get("/", [], response_example),
  route.get("/readfile", [], readFile_example)
])

const server = http.createServer(adapter(app))
server.listen(3000)
