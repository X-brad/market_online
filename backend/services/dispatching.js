const User = require('../models/User')
const Course = require('../models/Course')
const Marche = require('../models/Marche')
const { distanceKm } = require('../utils/geo')
const { communeRegex } = require('../utils/text')
const { getIO } = require('../socket')

const DELAI_OFFRE_MS = 20000
const minuteurs = new Map()

async function calculerCandidats(course) {
  const marche = await Marche.findOne({ nom: course.marche })

  const candidates = await User.find({
    role: 'coursiere',
    actif: true,
    commune: communeRegex(course.commune),
    'coursiere.statut': 'disponible',
    'coursiere.unitesActives': true,
    'coursiere.valide': true
  })

  const debutJour = new Date()
  debutJour.setHours(0, 0, 0, 0)

  const scores = await Promise.all(candidates.map(async (c) => {
    const coursesAujourdhui = await Course.countDocuments({
      coursiere: c._id,
      createdAt: { $gte: debutJour }
    })

    let distance = Infinity
    if (marche?.lat != null && c.coursiere?.position?.lat != null) {
      distance = distanceKm(marche.lat, marche.lng, c.coursiere.position.lat, c.coursiere.position.lng)
    }

    return { id: c._id, distance, coursesAujourdhui }
  }))

  scores.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance
    return a.coursesAujourdhui - b.coursesAujourdhui
  })

  return scores.map(s => s.id)
}

async function demarrerDispatching(courseId) {
  const course = await Course.findById(courseId)
  if (!course || course.statut !== 'en_attente') return

  const candidats = await calculerCandidats(course)
  course.dispatching = { candidats, indexActuel: 0 }
  await course.save()

  await proposerAuCandidatSuivant(courseId)
}

async function proposerAuCandidatSuivant(courseId) {
  const course = await Course.findById(courseId)
  if (!course || course.statut !== 'en_attente') return

  const { candidats, indexActuel } = course.dispatching

  if (!candidats || indexActuel >= candidats.length) {
    getIO()?.to(course._id.toString()).emit('dispatching_epuise', { courseId: course._id })
    return
  }

  const coursiereId = candidats[indexActuel]
  const expirationOffre = Date.now() + DELAI_OFFRE_MS
  getIO()?.to('coursiere_' + coursiereId.toString()).emit('nouvelle_course', { course, expirationOffre, delaiMs: DELAI_OFFRE_MS })

  annulerMinuteur(courseId)
  const handle = setTimeout(() => passerAuSuivant(courseId), DELAI_OFFRE_MS)
  minuteurs.set(courseId.toString(), handle)
}

async function passerAuSuivant(courseId) {
  const course = await Course.findById(courseId)
  if (!course || course.statut !== 'en_attente') return

  course.dispatching.indexActuel += 1
  await course.save()

  await proposerAuCandidatSuivant(courseId)
}

function annulerMinuteur(courseId) {
  const cle = courseId.toString()
  const handle = minuteurs.get(cle)
  if (handle) {
    clearTimeout(handle)
    minuteurs.delete(cle)
  }
}

module.exports = { demarrerDispatching, proposerAuCandidatSuivant, passerAuSuivant, annulerMinuteur, DELAI_OFFRE_MS }
