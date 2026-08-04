 const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const User = require('../models/User')
const Settings = require('../models/Settings')

// PUT /api/client/premium — Souscrire à l'abonnement premium (choix libre de la commune)
router.put('/premium', proteger, autoriser('client'), async (req, res) => {
  try {
    const settings = await Settings.getSettings()
    const expiration = new Date()
    expiration.setDate(expiration.getDate() + settings.dureePremiumJours)

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { premium: { actif: true, expiration } },
      { new: true }
    )

    res.json({ succes: true, message: 'Abonnement premium activé', premium: user.premium, prix: settings.prixPremiumClient })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router
