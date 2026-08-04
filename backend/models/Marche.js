const mongoose = require('mongoose')

const MarcheSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  commune: { type: String, required: true },
  icon: { type: String, default: '🏪' },
  actif: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Marche', MarcheSchema)
