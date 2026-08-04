const Transaction = require('../models/Transaction')
const Course = require('../models/Course')
const { getIO } = require('../socket')

exports.creerTransaction = async (req, res) => {
  try {
    const { courseId, methodePaiement, montantTotal } = req.body

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ succes: false, message: 'Course introuvable' })

    if (course.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }
    if (course.paiementEffectue) {
      return res.status(400).json({ succes: false, message: 'Cette course a déjà été payée' })
    }

    const transaction = await Transaction.create({
      course: courseId,
      client: req.user._id,
      coursiere: course.coursiere || null,
      montantTotal: montantTotal || course.totalPaye || 0,
      budgetCourses: course.budgetCourses || 0,
      fraisPrestation: course.fraisPrestation || 0,
      fraisLivraison: course.fraisLivraison || 0,
      fraisService: course.fraisService || 200,
      methodePaiement: methodePaiement || 'wave',
      statut: 'complete',
      referenceWave: 'WAVE_' + Date.now()
    })

    course.paiementEffectue = true
    course.statut = 'en_cours'
    await course.save()

    getIO()?.to(course._id.toString()).emit('statut_change', { course })

    res.status(201).json({ succes: true, transaction })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
}

exports.mesTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ client: req.user._id })
      .populate('course', 'marche liste statut')
      .populate('coursiere', 'nom prenom')
      .sort({ createdAt: -1 })

    res.json({ succes: true, transactions })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

exports.statsTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ statut: 'complete' })
    const revenus = transactions.reduce((acc, t) => acc + t.fraisService, 0)
    const total = transactions.length

    res.json({ succes: true, stats: { revenus, total } })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
} 