const { Server } = require('socket.io')
const corsOrigins = require('./utils/corsOrigins')

let io = null

function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.origin,
      methods: ['GET', 'POST']
    }
  })
  return io
}

function getIO() {
  return io
}

module.exports = { init, getIO }
