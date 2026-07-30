 const Course = require('../models/Course')
const User = require('../models/User')

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

    res.status(201).json({ succes: true, course })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

// GET /api/courses/mes-courses — Courses du client connecté
exports.mesCourses = async (req, res) => {
  try {
    const courses = await Course.find({ client: req.user._id })
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

    course.statut = statut
    await course.save()

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/devis — Coursière propose un devis
exports.proposerDevis = async (req, res) => {
  try {
    const { fraisPrestation, fraisLivraison, budgetCourses } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    course.fraisPrestation = fraisPrestation
    course.fraisLivraison = fraisLivraison
    course.budgetCourses = budgetCourses
    course.totalPaye = budgetCourses + fraisPrestation + fraisLivraison + 200
    await course.save()

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/noter — Client note la coursière
exports.noterCoursiere = async (req, res) => {
  try {
    const { note, commentaire } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

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
