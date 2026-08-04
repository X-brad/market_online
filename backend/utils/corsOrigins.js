const AUTORISES = ['http://localhost:5173', 'http://localhost:5174']
const LAN = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(5173|5174)$/

function origin(origin, callback) {
  if (!origin || AUTORISES.includes(origin) || LAN.test(origin)) {
    return callback(null, true)
  }
  callback(new Error('Origine non autorisée par CORS'))
}

module.exports = { origin }
