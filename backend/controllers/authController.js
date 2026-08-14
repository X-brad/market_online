const jwt = require('jsonwebtoken')
const User = require('../models/User')

const genererToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

exports.inscription = async (req, res) => {
  try {
    const { nom, prenom, pseudo, telephone, email, motDePasse, role, commune, coursiere } = req.body

    const conditions = [{ telephone }]
    if (pseudo) conditions.push({ pseudo: pseudo.toLowerCase() })
    if (email) conditions.push({ email: email.toLowerCase() })

    const existeDeja = await User.findOne({ $or: conditions })
    if (existeDeja) {
      return res.status(400).json({ succes: false, message: 'Ce numéro, pseudo ou email est déjà utilisé' })
    }

    const roleAutorise = role === 'coursiere' ? 'coursiere' : 'client'
    const userData = { nom, prenom, telephone, motDePasse, role: roleAutorise, commune }
    if (pseudo) userData.pseudo = pseudo
    if (email) userData.email = email
    if (roleAutorise === 'coursiere' && coursiere) userData.coursiere = coursiere

    const user = await User.create(userData)
    const token = genererToken(user._id)

    res.status(201).json({
      succes: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        pseudo: user.pseudo,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        commune: user.commune,
        photoUrl: user.photoUrl
      }
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const premierMessage = Object.values(err.errors)[0].message
      return res.status(400).json({ succes: false, message: premierMessage })
    }
    if (err.code === 11000) {
      const champ = Object.keys(err.keyPattern)[0]
      const libelles = { telephone: 'Ce numéro de téléphone', pseudo: 'Ce pseudo', email: 'Cette adresse email' }
      return res.status(400).json({ succes: false, message: `${libelles[champ] || 'Ce champ'} est déjà utilisé` })
    }
    res.status(400).json({ succes: false, message: err.message })
  }
}

exports.connexion = async (req, res) => {
  try {
    const { identifiant, motDePasse } = req.body

    if (!identifiant || !motDePasse) {
      return res.status(400).json({ succes: false, message: 'Identifiant et mot de passe requis' })
    }

    const user = await User.findOne({
      $or: [
        { telephone: identifiant },
        { pseudo: identifiant.toLowerCase() }
      ]
    }).select('+motDePasse')

    if (!user) return res.status(401).json({ succes: false, message: 'Identifiants incorrects' })

    const ok = await user.verifierMotDePasse(motDePasse)
    if (!ok) return res.status(401).json({ succes: false, message: 'Identifiants incorrects' })

    const token = genererToken(user._id)

    res.json({
      succes: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        pseudo: user.pseudo,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        commune: user.commune,
        photoUrl: user.photoUrl,
        coursiere: user.role === 'coursiere' ? user.coursiere : undefined
      }
    })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
}

exports.moi = async (req, res) => {
  res.json({ succes: true, user: req.user })
}