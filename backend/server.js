const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require('http')
const { init: initSocket } = require('./socket')
const corsOrigins = require('./utils/corsOrigins')
require('dotenv').config()

const app = express()
const httpServer = createServer(app)
const io = initSocket(httpServer)
app.use(cors({
  origin: corsOrigins.origin,
  credentials: true
}))
app.use(express.json())  // ← ajoute cette ligne ici;
app.use('/api/auth', require('./routes/auth'))
app.use('/api/client', require('./routes/client'))
app.use('/api/coursiere', require('./routes/coursiere'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/litiges', require('./routes/litiges'))
app.use('/api/marches', require('./routes/marches'))
app.use('/api/parametres', require('./routes/parametres'))

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

  // Rejoindre sa room personnelle de coursière (pour recevoir les propositions ciblées du dispatching)
  socket.on('rejoindre_coursiere', (coursiereId) => {
    socket.join('coursiere_' + coursiereId)
    console.log(`👩🏾 Socket ${socket.id} a rejoint la room coursiere_${coursiereId}`)
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