const express = require('express')
const router = express.Router()
const { proteger } = require('../middleware/auth')
const Settings = require('../models/Settings')

// GET /api/parametres — Paramètres publics (accessibles à tout utilisateur connecté)
router.get('/', proteger, async (req, res) => {
  try {
    const settings = await Settings.getSettings()
    res.json({
      succes: true,
      fraisService: settings.fraisService,
      prixPremiumClient: settings.prixPremiumClient,
      dureePremiumJours: settings.dureePremiumJours
    })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router
