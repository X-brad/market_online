 const express = require('express')
const router = express.Router()
const {
  creerCourse,
  mesCourses,
  coursesDisponibles,
  accepterCourse,
  refuserCourse,
  mettreAJourStatut,
  confirmerReception,
  validerBudget,
  gererLivraison,
  noterCoursiere,
  statsAdmin
} = require('../controllers/courseController')
const { messagesDeCourse } = require('../controllers/messageController')
const { proteger, autoriser } = require('../middleware/auth')

router.post('/', proteger, autoriser('client'), creerCourse)
router.get('/mes-courses', proteger, mesCourses)
router.get('/disponibles', proteger, autoriser('coursiere'), coursesDisponibles)
router.get('/stats', proteger, autoriser('admin'), statsAdmin)
router.get('/:id/messages', proteger, messagesDeCourse)
router.put('/:id/accepter', proteger, autoriser('coursiere'), accepterCourse)
router.put('/:id/refuser', proteger, autoriser('coursiere'), refuserCourse)
router.put('/:id/statut', proteger, mettreAJourStatut)
router.put('/:id/confirmer-reception', proteger, autoriser('client'), confirmerReception)
router.put('/:id/budget', proteger, autoriser('client'), validerBudget)
router.put('/:id/livraison', proteger, gererLivraison)
router.put('/:id/noter', proteger, autoriser('client'), noterCoursiere)

module.exports = router
