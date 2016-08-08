const http = require("http")

const s = http.createServer(function(req, res) {
  res.writeHead(200, {
    "Content-Length": 11
  })
  res.end("Hello World")
})

s.listen(3009)
