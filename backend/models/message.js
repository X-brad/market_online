const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  texte: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['normal', 'liste', 'devis', 'systeme'],
    default: 'normal'
  },
  devis: {
    prestation: { type: Number, default: 0 },
    livraison: { type: Number, default: 0 }
  },
  lu: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Message', MessageSchema)