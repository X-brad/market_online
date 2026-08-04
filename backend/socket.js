const { Server } = require('socket.io')

let io = null

function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST']
    }
  })
  return io
}

function getIO() {
  return io
}

module.exports = { init, getIO }
