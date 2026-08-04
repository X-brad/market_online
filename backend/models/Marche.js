const mongoose = require('mongoose')

const MarcheSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  commune: { type: String, required: true },
  icon: { type: String, default: '🏪' },
  actif: { type: Boolean, default: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null }
}, { timestamps: true })

module.exports = mongoose.model('Marche', MarcheSchema)
