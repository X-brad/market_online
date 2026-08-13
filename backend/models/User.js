const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  telephone: { type: String, required: true, unique: true, trim: true },
  pseudo: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  motDePasse: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['client', 'coursiere', 'admin'], default: 'client' },
  commune: { type: String, required: true },
  photoUrl: { type: String, default: null },
  premium: {
    actif: { type: Boolean, default: false },
    expiration: { type: Date, default: null }
  },
  coursiere: {
    typeProfile: { type: String, enum: ['standard', 'premium'], default: 'standard' },
    estVendeuse: { type: Boolean, default: false },
    marches: [{ type: String }],
    statut: { type: String, enum: ['disponible', 'occupee', 'hors_ligne'], default: 'hors_ligne' },
    unitesActives: { type: Boolean, default: false },
    unitesExpiration: { type: Date },
    coursesAujourdhui: { type: Number, default: 0 },
    quotaJournalier: { type: Number, default: 10 },
    quotaDepuis: { type: Date, default: null },
    note: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 },
    valide: { type: Boolean, default: false },
    position: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      misAJourLe: { type: Date, default: null }
    }
  },
  actif: { type: Boolean, default: true }
}, { timestamps: true })

UserSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return
  const salt = await bcrypt.genSalt(10)
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt)
})

UserSchema.methods.verifierMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse)
}

module.exports = mongoose.model('User', UserSchema)