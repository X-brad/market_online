const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const User = require('../models/User')

// GET /api/coursiere/disponibles
router.get('/disponibles', proteger, async (req, res) => {
  try {
    const filtre = { role: 'coursiere' }

    const coursieres = await User.find(filtre)
      .select('nom prenom commune coursiere')
      .sort({ 'coursiere.note': -1 })

    const data = coursieres.map(c => ({
      _id: c._id,
      nom: `${c.prenom} ${c.nom}`,
      initiales: (c.prenom[0] || '') + (c.nom[0] || ''),
      commune: c.commune,
      marche: c.coursiere?.marches?.[0] || 'Non défini',
      type: c.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard',
      statut: c.coursiere?.statut || 'hors_ligne',
      note: c.coursiere?.nombreAvis > 0
        ? Math.round(c.coursiere.note / c.coursiere.nombreAvis * 10) / 10
        : 0,
      courses: c.coursiere?.coursesAujourdhui || 0,
      distance: '~1.5 km'
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
    await User.findByIdAndUpdate(req.user._id, { 'coursiere.statut': statut })
    res.json({ succes: true, message: 'Statut mis à jour' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/coursiere/unites
router.put('/unites', proteger, autoriser('coursiere'), async (req, res) => {
  try {
    const { type } = req.body
    const quota = type === 'premium' ? 15 : 10
    const expiration = new Date()
    expiration.setHours(23, 59, 59, 999)

    await User.findByIdAndUpdate(req.user._id, {
      'coursiere.unitesActives': true,
      'coursiere.unitesExpiration': expiration,
      'coursiere.quotaJournalier': quota,
      'coursiere.typeProfile': type,
      'coursiere.statut': 'disponible'
    })
    res.json({ succes: true, message: 'Unités activées' })
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