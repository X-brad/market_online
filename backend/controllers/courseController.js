
 const { calculerFraisPrestation } = require('../utils/calculPrestation')
 const Course = require('../models/Course')
const User = require('../models/User')
const Settings = require('../models/Settings')
const { getIO } = require('../socket')
const { demarrerDispatching, passerAuSuivant, annulerMinuteur } = require('../services/dispatching')
const { debutFenetreQuota } = require('../utils/quota')

async function coursesAujourdhui(coursiereId, coursiere) {
  return Course.countDocuments({ coursiere: coursiereId, createdAt: { $gte: debutFenetreQuota(coursiere) } })
}

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

    // Laisse au client le temps de rejoindre la room de la course avant le premier envoi
    setTimeout(() => demarrerDispatching(course._id), 500)

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
      .populate('coursiere', 'nom prenom telephone coursiere')
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

    // Vérifier que c'est bien la candidate actuellement ciblée par le dispatching
    const candidatActuel = course.dispatching?.candidats?.[course.dispatching.indexActuel]
    if (candidatActuel && candidatActuel.toString() !== req.user._id.toString()) {
      return res.status(400).json({ succes: false, message: 'Cette course n\'est plus disponible' })
    }

    // Vérifier quota journalier (calculé en direct, pas un compteur qui ne se remet jamais à zéro)
    const coursiere = await User.findById(req.user._id)
    const dejaAujourdhui = await coursesAujourdhui(req.user._id, coursiere.coursiere)
    if (dejaAujourdhui >= coursiere.coursiere.quotaJournalier) {
      return res.status(400).json({ succes: false, message: 'Quota journalier atteint' })
    }

    annulerMinuteur(course._id)

    course.coursiere = req.user._id
    course.statut = 'assignee'
    await course.save()

    // Incrémenter courses du jour (compteur d'affichage)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'coursiere.coursesAujourdhui': 1 }
    })

    await course.populate('coursiere', 'nom prenom telephone')
    await course.populate('client', 'nom prenom telephone')
    getIO()?.to(course._id.toString()).emit('course_assignee', { course })

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/refuser — Coursière refuse la course qui lui est proposée
exports.refuserCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    const candidatActuel = course.dispatching?.candidats?.[course.dispatching.indexActuel]
    if (!candidatActuel || candidatActuel.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Cette course ne vous est pas proposée' })
    }

    annulerMinuteur(course._id)
    await passerAuSuivant(course._id)

    res.json({ succes: true })
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

    // Seul le client peut confirmer la réception du colis (via /confirmer-reception),
    // pas cet endpoint générique — empêche la coursière de se déclarer livrée elle-même
    if (statut === 'livree' && req.user.role !== 'admin') {
      return res.status(403).json({ succes: false, message: 'Seul le client peut confirmer la réception du colis' })
    }

    course.statut = statut
    await course.save()

    getIO()?.to(course._id.toString()).emit('statut_change', { course })

    res.json({ succes: true, course })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/confirmer-reception — Client confirme avoir reçu son colis
exports.confirmerReception = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (course.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }
    if (course.livraison.statut !== 'commandee') {
      return res.status(400).json({ succes: false, message: 'Le livreur doit d\'abord être réservé avant de confirmer la réception' })
    }

    course.livraison.statut = 'livree'
    course.livraison.receptionConfirmeeLe = new Date()
    course.statut = 'livree'
    await course.save()

    await course.populate('coursiere', 'nom prenom telephone')
    await course.populate('client', 'nom prenom telephone')

    getIO()?.to(course._id.toString()).emit('livraison_maj', { course })
    getIO()?.to(course._id.toString()).emit('statut_change', { course })

    res.json({ succes: true, course })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/budget — Client fixe son budget de courses
exports.validerBudget = async (req, res) => {
  try {
    const { budgetCourses } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (course.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    const settings = await Settings.getSettings()
    const fraisPrestation = calculerFraisPrestation(budgetCourses)

    course.budgetCourses = budgetCourses
    course.fraisPrestation = fraisPrestation
    course.fraisService = settings.fraisService
    course.totalPaye = budgetCourses + fraisPrestation + settings.fraisService
    await course.save()

    getIO()?.to(course._id.toString()).emit('budget_valide', { course })

    res.json({ succes: true, course, fraisPrestation })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

// PUT /api/courses/:id/livraison — Livraison via Yango Moto (proposer/accepter/refuser/commander)
exports.gererLivraison = async (req, res) => {
  try {
    const { action, livreurNom, livreurTelephone, adresseLivraison, dureeRecuperation, dureeLivraison, prix } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    const estClient = course.client.toString() === req.user._id.toString()
    const estCoursiere = course.coursiere && course.coursiere.toString() === req.user._id.toString()
    if (!estClient && !estCoursiere) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    if (action === 'proposer') {
      if (!estCoursiere) return res.status(403).json({ succes: false, message: 'Accès refusé' })
      if (!course.paiementEffectue) {
        return res.status(400).json({ succes: false, message: 'Le paiement du client est requis avant de proposer une livraison' })
      }
      course.livraison = {
        statut: 'proposee',
        livreurNom, livreurTelephone, adresseLivraison, dureeRecuperation, dureeLivraison,
        prix: prix || 0,
        proposeeLe: new Date()
      }
      course.fraisLivraison = prix || 0
    } else if (action === 'accepter') {
      if (!estClient) return res.status(403).json({ succes: false, message: 'Accès refusé' })
      course.livraison.statut = 'acceptee'
    } else if (action === 'refuser') {
      if (!estClient) return res.status(403).json({ succes: false, message: 'Accès refusé' })
      course.livraison.statut = 'non_demandee'
    } else if (action === 'commander') {
      if (!estCoursiere) return res.status(403).json({ succes: false, message: 'Accès refusé' })
      if (course.livraison.statut !== 'acceptee') {
        return res.status(400).json({ succes: false, message: 'Le client doit d\'abord accepter la proposition' })
      }
      course.livraison.statut = 'commandee'
    } else {
      return res.status(400).json({ succes: false, message: 'Action invalide' })
    }

    await course.save()
    getIO()?.to(course._id.toString()).emit('livraison_maj', { course })

    res.json({ succes: true, course })
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
