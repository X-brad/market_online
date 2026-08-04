
 const { calculerFraisPrestation } = require('../utils/calculPrestation')
 const Course = require('../models/Course')
const User = require('../models/User')
const Settings = require('../models/Settings')
const { getIO } = require('../socket')

// POST /api/courses — Créer une course
exports.creerCourse = async (req, res) => {
  try {
    const { marche, commune, liste, mode } = req.body

    const course = await Course.create({
      client: req.user._id,
      marche,
      commune,
      liste,
      mode: mode || 'standard'
    })

    getIO()?.emit('nouvelle_course', course)

    res.status(201).json({ succes: true, course })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

// GET /api/courses/mes-courses — Courses de l'utilisateur connecté (client ou coursière)
exports.mesCourses = async (req, res) => {
  try {
    const filtre = req.user.role === 'coursiere'
      ? { coursiere: req.user._id }
      : { client: req.user._id }

    const courses = await Course.find(filtre)
      .populate('client', 'nom prenom telephone')
      .populate('coursiere', 'nom prenom telephone')
      .sort({ createdAt: -1 })

    res.json({ succes: true, courses })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// GET /api/courses/disponibles — Courses disponibles pour les coursières
exports.coursesDisponibles = async (req, res) => {
  try {
    const { commune } = req.query

    const filtre = { statut: 'en_attente' }
    if (commune) filtre.commune = commune

    const courses = await Course.find(filtre)
      .populate('client', 'nom prenom commune')
      .sort({ createdAt: -1 })

    res.json({ succes: true, courses })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/accepter — Coursière accepte une course
exports.accepterCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (course.statut !== 'en_attente') {
      return res.status(400).json({ succes: false, message: 'Cette course n\'est plus disponible' })
    }

    // Vérifier quota journalier
    const coursiere = await User.findById(req.user._id)
    if (coursiere.coursiere.coursesAujourdhui >= coursiere.coursiere.quotaJournalier) {
      return res.status(400).json({ succes: false, message: 'Quota journalier atteint' })
    }

    course.coursiere = req.user._id
    course.statut = 'assignee'
    await course.save()

    // Incrémenter courses du jour
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'coursiere.coursesAujourdhui': 1 }
    })

    await course.populate('coursiere', 'nom prenom telephone')
    getIO()?.to(course._id.toString()).emit('course_assignee', { course })

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/statut — Mettre à jour le statut
exports.mettreAJourStatut = async (req, res) => {
  try {
    const { statut } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    const estClient = course.client.toString() === req.user._id.toString()
    const estCoursiere = course.coursiere && course.coursiere.toString() === req.user._id.toString()
    if (!estClient && !estCoursiere && req.user.role !== 'admin') {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    course.statut = statut
    await course.save()

    getIO()?.to(course._id.toString()).emit('statut_change', { course })

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/devis — Coursière propose un devis
exports.proposerDevis = async (req, res) => {
  try {
    const { fraisLivraison, budgetCourses } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (!course.coursiere || course.coursiere.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Vous n\'êtes pas assignée à cette course' })
    }

    const settings = await Settings.getSettings()
    const fraisPrestation = calculerFraisPrestation(budgetCourses)

    course.fraisPrestation = fraisPrestation
    course.fraisLivraison = fraisLivraison
    course.budgetCourses = budgetCourses
    course.fraisService = settings.fraisService
    course.totalPaye = budgetCourses + fraisPrestation + fraisLivraison + settings.fraisService
    await course.save()

    getIO()?.to(course._id.toString()).emit('devis_propose', { course })

    res.json({ succes: true, course, fraisPrestation })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}
// PUT /api/courses/:id/noter — Client note la coursière
exports.noterCoursiere = async (req, res) => {
  try {
    const { note, commentaire } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (course.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }
    if (course.noteClient !== null) {
      return res.status(400).json({ succes: false, message: 'Cette course a déjà été notée' })
    }

    course.noteClient = note
    course.commentaireClient = commentaire
    await course.save()

    // Mettre à jour la note de la coursière
    const coursiere = await User.findById(course.coursiere)
    coursiere.coursiere.note += note
    coursiere.coursiere.nombreAvis += 1
    await coursiere.save()

    res.json({ succes: true, message: 'Note enregistrée' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// GET /api/courses/stats — Stats admin
exports.statsAdmin = async (req, res) => {
  try {
    const total = await Course.countDocuments()
    const livrees = await Course.countDocuments({ statut: 'livree' })
    const enCours = await Course.countDocuments({ statut: 'en_cours' })
    const enAttente = await Course.countDocuments({ statut: 'en_attente' })

    res.json({ succes: true, stats: { total, livrees, enCours, enAttente } })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}
