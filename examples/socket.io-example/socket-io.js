const {adapter, file_response} = require("spirit").node
const route = require("../../index")
const http = require("http")

const index = () => {
  return file_response(__dirname + "/index.html")
}

const app = route.define([
  route.get("/", [], index)
])

const server = http.createServer(adapter(app))
const io = require("socket.io")(server)

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg)
  })
})

server.listen(3000)

