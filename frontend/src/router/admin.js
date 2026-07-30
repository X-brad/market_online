const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const User = require('../models/User')
const Course = require('../models/Course')
const Transaction = require('../models/Transaction')

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

    const data = coursieres.map(c => ({
      id: c._id,
      nom: `${c.prenom} ${c.nom}`,
      initiales: (c.prenom[0] || '') + (c.nom[0] || ''),
      telephone: c.telephone,
      marche: c.coursiere?.marches?.[0] || '—',
      commune: c.commune,
      type: c.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard',
      statut: c.coursiere?.statut || 'hors_ligne',
      note: c.coursiere?.nombreAvis > 0
        ? Math.round(c.coursiere.note / c.coursiere.nombreAvis * 10) / 10
        : 0,
      courses: c.coursiere?.coursesAujourdhui || 0,
      valide: c.coursiere?.valide || false,
      actif: c.actif
    }))

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

// PUT /api/admin/tarifs — Modifier tarifs
router.put('/tarifs', proteger, autoriser('admin'), async (req, res) => {
  try {
    res.json({ succes: true, message: 'Tarifs mis à jour' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router