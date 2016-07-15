const {file_response, adapter} = require("spirit").node
const route = require("../index")
const http = require("http")
const Promise = require("bluebird")
const fs = Promise.promisifyAll(require("fs"), { suffix: "Promise" });

/*
 *  The following functions shows 3 different ways for sending
 *  a file.
 */

// with spirit.node.file_response
const response_example = () => {
  return file_response(__dirname + "/test-file.html")
}

// with fs.createReadStream
// NOTE: this does not handle errors from createReadStream
const stream_example = () => {
  return fs.createReadStream(__dirname + "/test-file.html")
}

// with fs.readFile (wrapped as a Promise)
// NOTE: in this example it doesn't set "Last-Modified" headers
// which the above 2 examples do set
const readfile_example = () => {
  return fs.readFilePromise(__dirname + "/test-file.html")
}

const app = route.define([
  route.get("/", [], response_example),
  route.get("/stream", [], stream_example),
  route.get("/readfile", [], readfile_example)
])

const server = http.createServer(adapter(app))
server.listen(3000)
