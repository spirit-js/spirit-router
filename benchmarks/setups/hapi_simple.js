// lifted from http://hapijs.com/tutorials/getting-started
const Hapi = require("hapi")

const server = new Hapi.Server()
server.connection({ port: 3009, compression: false })
//server.connection({ port: 3009 })

server.route({
  method: "GET",
  path: "/",
  handler: function (request, reply) {
    return reply("Hello World")
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
})
