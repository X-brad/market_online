const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const Marche = require('../models/Marche')
const User = require('../models/User')
const Course = require('../models/Course')

const MARCHES_INITIAUX = [
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🏪' },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🛒' },
  { nom: "Marché d'Adjamé", commune: 'Adjamé', icon: '🏪' },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒' },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪' },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒' }
]

async function assurerMarchesInitiaux() {
  const total = await Marche.countDocuments()
  if (total === 0) await Marche.insertMany(MARCHES_INITIAUX)
}

// GET /api/marches — Liste des marchés (?actif=true pour ne garder que les actifs) — public
router.get('/', async (req, res) => {
  try {
    await assurerMarchesInitiaux()
    const filtre = {}
    if (req.query.actif === 'true') filtre.actif = true

    const marches = await Marche.find(filtre).sort({ nom: 1 })
    res.json({ succes: true, marches })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// GET /api/marches/stats — Marchés avec coursières et courses du jour (admin)
router.get('/stats', proteger, autoriser('admin'), async (req, res) => {
  try {
    await assurerMarchesInitiaux()
    const marches = await Marche.find().sort({ nom: 1 })

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const data = await Promise.all(marches.map(async (m) => {
      const coursieres = await User.find({ role: 'coursiere', 'coursiere.marches': m.nom })
      const coursesJour = await Course.countDocuments({ marche: m.nom, createdAt: { $gte: debutJour } })
      const avecAvis = coursieres.filter(c => c.coursiere?.nombreAvis > 0)
      const note = avecAvis.length > 0
        ? Math.round(avecAvis.reduce((acc, c) => acc + c.coursiere.note / c.coursiere.nombreAvis, 0) / avecAvis.length * 10) / 10
        : null

      return {
        id: m._id,
        nom: m.nom,
        commune: m.commune,
        icon: m.icon,
        actif: m.actif,
        coursieres: coursieres.length,
        coursesJour,
        note
      }
    }))

    res.json({ succes: true, marches: data })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/marches/:id — Activer/désactiver un marché (admin)
router.put('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const { actif } = req.body
    const marche = await Marche.findByIdAndUpdate(req.params.id, { actif }, { new: true })
    if (!marche) return res.status(404).json({ succes: false, message: 'Marché introuvable' })

    res.json({ succes: true, marche })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router
