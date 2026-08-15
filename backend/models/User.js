const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true, maxlength: 50 },
  prenom: { type: String, required: true, trim: true, maxlength: 50 },
  telephone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^0[0-9]{9}$/, 'Le numéro de téléphone doit contenir 10 chiffres et commencer par 0']
  },
  pseudo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres et underscores']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Adresse email invalide']
  },
  // maxlength 72 : bcrypt tronque silencieusement au-delà de 72 octets
  motDePasse: { type: String, required: true, minlength: 6, maxlength: 72, select: false },
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
    description: { type: String, default: '', trim: true, maxlength: 500 },
    // Drapeau permanent : posé une seule fois quand les 5 étapes d'onboarding sont
    // franchies. Distinct de l'état courant (statut/unités) qui varie au quotidien,
    // pour ne pas re-bloquer une coursière déjà onboardée quand elle repasse hors ligne.
    onboardingComplete: { type: Boolean, default: false },
    position: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      misAJourLe: { type: Date, default: null }
    }
  },
  actif: { type: Boolean, default: true },
  motifSuspension: { type: String, default: null, trim: true, maxlength: 300 }
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