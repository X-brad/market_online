const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const Marche = require('../models/Marche')
const User = require('../models/User')
const Course = require('../models/Course')
const { communeRegex } = require('../utils/text')

const MARCHES_INITIAUX = [
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🏪', lat: 5.3599, lng: -3.9866 },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🛒', lat: 5.3550, lng: -3.9800 },
  { nom: "Marché d'Adjamé", commune: 'Adjamé', icon: '🏪', lat: 5.3667, lng: -4.0167 },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒', lat: 5.2926, lng: -4.0114 },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪', lat: 5.2926, lng: -3.9531 },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒', lat: 5.3556, lng: -3.8894 },
  { nom: 'Marché de Marcory', commune: 'Marcory', icon: '🏪', lat: 5.2926, lng: -3.9819 },
  { nom: 'Marché du Plateau', commune: 'Plateau', icon: '🛒', lat: 5.3197, lng: -4.0227 },
  { nom: 'Marché de Yopougon', commune: 'Yopougon', icon: '🏪', lat: 5.3450, lng: -4.0850 },
  { nom: "Marché Gouro d'Abobo", commune: 'Abobo', icon: '🛒', lat: 5.4181, lng: -4.0154 }
]

// Ce contrôle/backfill est un besoin de démarrage (seed), pas un besoin par requête —
// le refaire à chaque appel ajoutait ~2s de latence réseau vers MongoDB Atlas sur
// chaque chargement de /marches (jusqu'à 20 allers-retours séquentiels).
let marchesInitiauxVerifies = false

async function assurerMarchesInitiaux() {
  if (marchesInitiauxVerifies) return
  const total = await Marche.countDocuments()
  if (total === 0) {
    await Marche.insertMany(MARCHES_INITIAUX)
    marchesInitiauxVerifies = true
    return
  }
  // Complète les coordonnées des marchés déjà existants qui n'en ont pas encore,
  // et ajoute les marchés initiaux qui n'existent pas encore en base
  for (const m of MARCHES_INITIAUX) {
    await Marche.updateOne({ nom: m.nom, lat: null }, { $set: { lat: m.lat, lng: m.lng } })
    const existe = await Marche.exists({ nom: m.nom })
    if (!existe) await Marche.create(m)
  }
  marchesInitiauxVerifies = true
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
      const coursieres = await User.find({ role: 'coursiere', commune: communeRegex(m.commune) })
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
