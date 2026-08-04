const express = require('express')
const router = express.Router()
const { proteger, autoriser } = require('../middleware/auth')
const Litige = require('../models/Litige')
const Course = require('../models/Course')

// POST /api/litiges — Le client ou la coursière signale un problème sur une course
router.post('/', proteger, async (req, res) => {
  try {
    const { courseId, titre, description } = req.body

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    const estClient = course.client.toString() === req.user._id.toString()
    const estCoursiere = course.coursiere && course.coursiere.toString() === req.user._id.toString()
    if (!estClient && !estCoursiere) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    const litige = await Litige.create({
      course: courseId,
      client: course.client,
      coursiere: course.coursiere || null,
      titre,
      description
    })

    res.status(201).json({ succes: true, litige })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
})

// GET /api/litiges — Liste des litiges (admin)
router.get('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const litiges = await Litige.find()
      .populate('client', 'nom prenom')
      .populate('coursiere', 'nom prenom')
      .populate('course', 'marche')
      .sort({ createdAt: -1 })

    res.json({ succes: true, litiges })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// PUT /api/litiges/:id/resoudre — Marquer un litige comme résolu (admin)
router.put('/:id/resoudre', proteger, autoriser('admin'), async (req, res) => {
  try {
    const litige = await Litige.findByIdAndUpdate(req.params.id, { statut: 'resolu' }, { new: true })
    if (!litige) return res.status(404).json({ succes: false, message: 'Litige introuvable' })

    res.json({ succes: true, litige })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router
