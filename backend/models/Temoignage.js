const mongoose = require('mongoose')

const TemoignageSchema = new mongoose.Schema({
  nomClient: { type: String, required: true, trim: true, maxlength: 80 },
  texte: { type: String, required: true, trim: true, maxlength: 400 },
  photoUrl: { type: String, default: null }
}, { timestamps: true })

module.exports = mongoose.model('Temoignage', TemoignageSchema)
