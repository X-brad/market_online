const Message = require('../models/Message')
const Course = require('../models/Course')
const { getIO } = require('../socket')

async function verifierAcces(course, userId) {
  const estClient = course.client.toString() === userId.toString()
  const estCoursiere = course.coursiere && course.coursiere.toString() === userId.toString()
  return estClient || estCoursiere
}

// POST /api/messages — Envoyer un message lié à une course
exports.envoyerMessage = async (req, res) => {
  try {
    const { course: courseId, texte, type, devis } = req.body

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (!(await verifierAcces(course, req.user._id))) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    const estClient = course.client.toString() === req.user._id.toString()
    const destinataire = estClient ? course.coursiere : course.client
    if (!destinataire) {
      return res.status(400).json({ succes: false, message: 'Aucune coursière assignée à cette course' })
    }

    const message = await Message.create({
      course: courseId,
      expediteur: req.user._id,
      destinataire,
      texte: texte || '',
      type: type || 'normal',
      devis: devis || undefined
    })

    getIO()?.to(courseId).emit('nouveau_message', message)

    res.status(201).json({ succes: true, message })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

// GET /api/courses/:id/messages — Historique des messages d'une course
exports.messagesDeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (!(await verifierAcces(course, req.user._id))) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    const messages = await Message.find({ course: req.params.id }).sort({ createdAt: 1 })

    res.json({ succes: true, messages })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}
