 const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
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
  marche: {
    type: String,
    required: true
  },
  commune: {
    type: String,
    required: true
  },
  liste: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['standard', 'premium'],
    default: 'standard'
  },
  statut: {
    type: String,
    enum: ['en_attente', 'assignee', 'en_cours', 'livree', 'annulee'],
    default: 'en_attente'
  },
  budgetCourses: {
    type: Number,
    default: 0
  },
  fraisPrestation: {
    type: Number,
    default: 0
  },
  fraisLivraison: {
    type: Number,
    default: 0
  },
  fraisService: {
    type: Number,
    default: 200
  },
  totalPaye: {
    type: Number,
    default: 0
  },
  paiementEffectue: {
    type: Boolean,
    default: false
  },
  noteClient: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  commentaireClient: {
    type: String,
    default: ''
  },
  dispatching: {
    candidats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    indexActuel: { type: Number, default: 0 }
  },
  livraison: {
    statut: {
      type: String,
      enum: ['non_demandee', 'proposee', 'acceptee', 'commandee'],
      default: 'non_demandee'
    },
    livreurNom: { type: String, default: '' },
    livreurTelephone: { type: String, default: '' },
    adresseLivraison: { type: String, default: '' },
    dureeRecuperation: { type: String, default: '' },
    dureeLivraison: { type: String, default: '' },
    prix: { type: Number, default: 0 },
    proposeeLe: { type: Date, default: null }
  }
}, { timestamps: true })

module.exports = mongoose.model('Course', CourseSchema)
