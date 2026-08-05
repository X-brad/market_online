const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const User = require('../models/User')
const Course = require('../models/Course')
const Transaction = require('../models/Transaction')
const Settings = require('../models/Settings')

// GET /api/admin/stats — Stats globales
router.get('/stats', proteger, autoriser('admin'), async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' })
    const totalCoursieres = await User.countDocuments({ role: 'coursiere' })
    const coursieresDispo = await User.countDocuments({ role: 'coursiere', 'coursiere.statut': 'disponible' })
    const totalCourses = await Course.countDocuments()
    const coursesLivrees = await Course.countDocuments({ statut: 'livree' })
    const coursesEnCours = await Course.countDocuments({ statut: 'en_cours' })
    const coursesEnAttente = await Course.countDocuments({ statut: 'en_attente' })
    const transactions = await Transaction.find({ statut: 'complete' })
    const revenus = transactions.reduce((acc, t) => acc + (t.fraisService || 200), 0)

    res.json({
      succes: true,
      stats: {
        totalClients,
        totalCoursieres,
        coursieresDispo,
        totalCourses,
        coursesLivrees,
        coursesEnCours,
        coursesEnAttente,
        revenus,
        totalTransactions: transactions.length
      }
    })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// GET /api/admin/coursieres — Liste toutes les coursières
router.get('/coursieres', proteger, autoriser('admin'), async (req, res) => {
  try {
    const coursieres = await User.find({ role: 'coursiere' })
      .select('nom prenom telephone commune coursiere createdAt actif')
      .sort({ createdAt: -1 })

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)

    const data = await Promise.all(coursieres.map(async (c) => ({
      id: c._id,
      nom: `${c.prenom} ${c.nom}`,
      initiales: (c.prenom[0] || '') + (c.nom[0] || ''),
      telephone: c.telephone,
      commune: c.commune,
      type: c.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard',
      statut: c.coursiere?.statut || 'hors_ligne',
      note: c.coursiere?.nombreAvis > 0
        ? Math.round(c.coursiere.note / c.coursiere.nombreAvis * 10) / 10
        : 0,
      courses: await Course.countDocuments({ coursiere: c._id, createdAt: { $gte: debutJour } }),
      valide: c.coursiere?.valide || false,
      actif: c.actif
    })))

    res.json({ succes: true, coursieres: data })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// GET /api/admin/transactions — Liste toutes les transactions
router.get('/transactions', proteger, autoriser('admin'), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('client', 'nom prenom')
      .populate('coursiere', 'nom prenom')
      .populate('course', 'marche')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ succes: true, transactions })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/admin/coursieres/:id/valider
router.put('/coursieres/:id/valider', proteger, autoriser('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { 'coursiere.valide': true })
    res.json({ succes: true, message: 'Coursière validée' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/admin/coursieres/:id/suspendre
router.put('/coursieres/:id/suspendre', proteger, autoriser('admin'), async (req, res) => {
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

// GET /api/admin/parametres — Tarifs, quotas et frais de service actuels
router.get('/parametres', proteger, autoriser('admin'), async (req, res) => {
  try {
    const settings = await Settings.getSettings()
    res.json({ succes: true, parametres: settings })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/admin/parametres — Modifier tarifs, quotas et frais de service
router.put('/parametres', proteger, autoriser('admin'), async (req, res) => {
  try {
    const champs = [
      'unitePrixStandardVendeuse', 'unitePrixStandardNonVendeuse',
      'unitePrixPremiumVendeuse', 'unitePrixPremiumNonVendeuse',
      'quotaStandard', 'quotaPremium', 'fraisService',
      'prixPremiumClient', 'dureePremiumJours'
    ]
    const maj = {}
    for (const champ of champs) {
      if (req.body[champ] !== undefined) maj[champ] = req.body[champ]
    }

    const settings = await Settings.getSettings()
    Object.assign(settings, maj)
    await settings.save()

    res.json({ succes: true, message: 'Paramètres mis à jour', parametres: settings })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
})

module.exports = router
