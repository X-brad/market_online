const mongoose = require('mongoose')
require('dotenv').config()
const User = require('./models/User')

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.findOneAndUpdate(
    { telephone: '0142211620' },
    { role: 'admin' }
  )
  console.log('✅ Rôle admin assigné !')
  process.exit()
}).catch(err => {
  console.error('❌ Erreur :', err.message)
  process.exit()
})