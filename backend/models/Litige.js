const mongoose = require('mongoose')

const LitigeSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coursiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  statut: {
    type: String,
    enum: ['ouvert', 'resolu'],
    default: 'ouvert'
  }
}, { timestamps: true })

module.exports = mongoose.model('Litige', LitigeSchema)
