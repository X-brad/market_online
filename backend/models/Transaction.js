 const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
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
  montantTotal: {
    type: Number,
    required: true
  },
  budgetCourses: {
    type: Number,
    required: true
  },
  fraisPrestation: {
    type: Number,
    required: true
  },
  fraisLivraison: {
    type: Number,
    required: true
  },
  fraisService: {
    type: Number,
    default: 200
  },
  methodePaiement: {
    type: String,
    enum: ['wave', 'orange_money', 'mtn_money'],
    default: 'wave'
  },
  statut: {
    type: String,
    enum: ['pending', 'complete', 'failed', 'rembourse'],
    default: 'pending'
  },
  referenceWave: {
    type: String,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('Transaction', TransactionSchema)
