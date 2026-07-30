 const express = require('express')
const router = express.Router()
const {
  creerCourse,
  mesCourses,
  coursesDisponibles,
  accepterCourse,
  mettreAJourStatut,
  proposerDevis,
  noterCoursiere,
  statsAdmin
} = require('../controllers/courseController')
const { proteger, autoriser } = require('../middleware/auth')

router.post('/', proteger, autoriser('client'), creerCourse)
router.get('/mes-courses', proteger, mesCourses)
router.get('/disponibles', proteger, autoriser('coursiere'), coursesDisponibles)
router.get('/stats', proteger, autoriser('admin'), statsAdmin)
router.put('/:id/accepter', proteger, autoriser('coursiere'), accepterCourse)
router.put('/:id/statut', proteger, mettreAJourStatut)
router.put('/:id/devis', proteger, autoriser('coursiere'), proposerDevis)
router.put('/:id/noter', proteger, autoriser('client'), noterCoursiere)

module.exports = router
