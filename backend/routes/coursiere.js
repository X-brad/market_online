const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { proteger, autoriser } = require('../middleware/auth')
const User = require('../models/User')
const Settings = require('../models/Settings')
const Course = require('../models/Course')
const Marche = require('../models/Marche')
const { distanceKm } = require('../utils/geo')
const { communeRegex } = require('../utils/text')
const { getIO } = require('../socket')

const DOSSIER_PHOTOS = path.join(__dirname, '..', 'uploads', 'profils')
fs.mkdirSync(DOSSIER_PHOTOS, { recursive: true })

const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, DOSSIER_PHOTOS),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${req.user._id}-${Date.now()}${ext}`)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return cb(new Error('Format d\'image non supporté (jpeg, png, webp ou gif uniquement)'))
    }
    cb(null, true)
  }
})

// POST /api/coursiere/photo — Upload de la photo de profil
router.post('/photo', proteger, autoriser('coursiere'), uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ succes: false, message: 'Aucune image envoyée' })

    const ancienUser = await User.findById(req.user._id).select('photoUrl')
    const photoUrl = `/uploads/profils/${req.file.filename}`
    await User.findByIdAndUpdate(req.user._id, { photoUrl })

    if (ancienUser?.photoUrl) {
      const ancienChemin = path.join(DOSSIER_PHOTOS, path.basename(ancienUser.photoUrl))
      fs.unlink(ancienChemin, () => {})
    }

    res.json({ succes: true, photoUrl })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// GET /api/coursiere/disponibles?commune=...&marche=... — aperçu réel des coursières
// éligibles pour une commande (celles réellement susceptibles de recevoir la
// proposition via le dispatching automatique, pas une liste sélectionnable)
router.get('/disponibles', proteger, async (req, res) => {
  try {
    const { commune, marche } = req.query
    const filtre = {
      role: 'coursiere',
      actif: true,
      'coursiere.statut': 'disponible',
      'coursiere.unitesActives': true,
      'coursiere.valide': true
    }
    if (commune) filtre.commune = communeRegex(commune)

    const coursieres = await User.find(filtre)
      .select('nom prenom commune coursiere')
      .sort({ 'coursiere.note': -1 })

    const marcheDoc = marche ? await Marche.findOne({ nom: marche }) : null

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const data = await Promise.all(coursieres.map(async (c) => {
      const coursesAujourdhui = await Course.countDocuments({
        coursiere: c._id,
        createdAt: { $gte: debutJour }
      })

      let distance = null
      if (marcheDoc?.lat != null && c.coursiere?.position?.lat != null) {
        distance = Math.round(distanceKm(marcheDoc.lat, marcheDoc.lng, c.coursiere.position.lat, c.coursiere.position.lng) * 10) / 10
      }

      return {
        _id: c._id,
        nom: `${c.prenom} ${c.nom}`,
        initiales: (c.prenom[0] || '') + (c.nom[0] || ''),
        commune: c.commune,
        marche: c.commune,
        type: c.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard',
        statut: c.coursiere?.statut || 'hors_ligne',
        note: c.coursiere?.nombreAvis > 0
          ? Math.round(c.coursiere.note / c.coursiere.nombreAvis * 10) / 10
          : 0,
        courses: coursesAujourdhui,
        distance: distance != null ? `${distance} km` : 'Distance inconnue'
      }
    }))

    res.json({ succes: true, coursieres: data })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// GET /api/coursiere/toutes — admin
router.get('/toutes', proteger, autoriser('admin'), async (req, res) => {
  try {
    const coursieres = await User.find({ role: 'coursiere' })
      .select('nom prenom telephone commune coursiere createdAt')
      .sort({ createdAt: -1 })
    res.json({ succes: true, coursieres })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/statut
router.put('/statut', proteger, autoriser('coursiere'), async (req, res) => {
  try {
    const { statut } = req.body
    if (statut === 'disponible' && !req.user.coursiere?.valide) {
      return res.status(403).json({ succes: false, message: 'Votre compte est en attente de validation par l\'administrateur' })
    }
    await User.findByIdAndUpdate(req.user._id, { 'coursiere.statut': statut })
    getIO()?.emit('coursiere_statut_change', { userId: req.user._id, statut })
    res.json({ succes: true, message: 'Statut mis à jour' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/position — mise à jour de la position GPS live
router.put('/position', proteger, autoriser('coursiere'), async (req, res) => {
  try {
    const { lat, lng } = req.body
    await User.findByIdAndUpdate(req.user._id, {
      'coursiere.position': { lat, lng, misAJourLe: new Date() }
    })

    const courseActive = await Course.findOne({
      coursiere: req.user._id,
      statut: { $in: ['assignee', 'en_cours'] }
    })
    if (courseActive) {
      getIO()?.to(courseActive._id.toString()).emit('position_maj', { lat, lng })
    }

    res.json({ succes: true })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/unites
router.put('/unites', proteger, autoriser('coursiere'), async (req, res) => {
  try {
    const { type } = req.body
    const settings = await Settings.getSettings()
    const quota = type === 'premium' ? settings.quotaPremium : settings.quotaStandard
    const estVendeuse = req.user.coursiere?.estVendeuse
    const prix = type === 'premium'
      ? (estVendeuse ? settings.unitePrixPremiumVendeuse : settings.unitePrixPremiumNonVendeuse)
      : (estVendeuse ? settings.unitePrixStandardVendeuse : settings.unitePrixStandardNonVendeuse)

    const finJour = new Date()
    finJour.setHours(23, 59, 59, 999)
    const maintenant = new Date()

    // Chaque paiement fait repartir son quota à 0/X immédiatement (même en plein
    // milieu de journée, même si elle avait déjà atteint son quota précédent),
    // au lieu d'attendre le reset naturel de minuit.
    await User.findByIdAndUpdate(req.user._id, {
      'coursiere.unitesActives': true,
      'coursiere.unitesExpiration': finJour,
      'coursiere.quotaJournalier': quota,
      'coursiere.quotaDepuis': maintenant,
      'coursiere.typeProfile': type,
      'coursiere.statut': 'disponible'
    })
    res.json({ succes: true, message: 'Unités activées', quota, prix })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/:id/valider — admin
router.put('/:id/valider', proteger, autoriser('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { 'coursiere.valide': true })
    res.json({ succes: true, message: 'Coursière validée' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/:id/suspendre — admin
router.put('/:id/suspendre', proteger, autoriser('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      'coursiere.statut': 'hors_ligne',
      actif: false
    })
    res.json({ succes: true, message: 'Coursière suspendue' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router