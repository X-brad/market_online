const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  
  
  ],
  
  credentials: true
}))
app.use(express.json())  // ← ajoute cette ligne ici;
app.use('/api/auth', require('./routes/auth'))
app.use('/api/client', require('./routes/client'))
app.use('/api/coursiere', require('./routes/coursiere'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/transactions', require('./routes/transactions'))

app.get('/', (req, res) => {
  res.json({ message: 'MamiMarché API ✅' })
})

// SOCKET.IO
io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id)

  // Rejoindre une room de course
  socket.on('rejoindre_course', (courseId) => {
    socket.join(courseId)
    console.log(`📦 Socket ${socket.id} a rejoint la room ${courseId}`)
  })

  // Envoyer un message
  socket.on('envoyer_message', (data) => {
    const { courseId, message } = data
    io.to(courseId).emit('nouveau_message', message)
  })

  // Statut coursière
  socket.on('statut_coursiere', (data) => {
    const { userId, statut } = data
    io.emit('coursiere_statut_change', { userId, statut })
  })

  // Nouvelle course disponible
  socket.on('nouvelle_course', (data) => {
    io.emit('course_disponible', data)
  })

  // Course acceptée
  socket.on('course_acceptee', (data) => {
    const { courseId, coursiere } = data
    io.to(courseId).emit('course_assignee', { coursiere })
  })

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté :', socket.id)
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ succes: false, message: err.message })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté')
    httpServer.listen(process.env.PORT, () => {
      console.log(`✅ Serveur sur le port ${process.env.PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message)
    process.exit(1)
  })

module.exports = { io }