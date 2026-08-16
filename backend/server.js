const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { createServer: createHttpServer } = require('http')
const { createServer: createHttpsServer } = require('https')
const { init: initSocket } = require('./socket')
const corsOrigins = require('./utils/corsOrigins')
require('dotenv').config()

const app = express()

// Certificat mkcert local (généré par frontend/scripts/set-lan-ip.js) : permet le HTTPS
// en dev, requis par certaines API navigateur (géolocalisation) sur mobile. Retombe sur
// du HTTP simple si les certificats n'existent pas encore (première installation, autre machine).
const CHEMIN_CERT = path.join(__dirname, '..', 'certs', 'dev.pem')
const CHEMIN_CLE = path.join(__dirname, '..', 'certs', 'dev-key.pem')
const httpsDisponible = fs.existsSync(CHEMIN_CERT) && fs.existsSync(CHEMIN_CLE)
const httpServer = httpsDisponible
  ? createHttpsServer({ cert: fs.readFileSync(CHEMIN_CERT), key: fs.readFileSync(CHEMIN_CLE) }, app)
  : createHttpServer(app)
const io = initSocket(httpServer)
app.use(cors({
  origin: corsOrigins.origin,
  credentials: true
}))
app.use(express.json())  // ← ajoute cette ligne ici;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
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
app.use('/api/temoignages', require('./routes/temoignages'))

app.get('/', (req, res) => {
  res.json({ message: 'Achètlà API ✅' })
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
      console.log(`✅ Serveur sur le port ${process.env.PORT} (${httpsDisponible ? 'HTTPS' : 'HTTP'})`)
    })
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message)
    process.exit(1)
  }) 