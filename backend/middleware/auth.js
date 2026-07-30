 
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.proteger = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ succes: false, message: 'Token manquant' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    if (!req.user || !req.user.actif) {
      return res.status(401).json({ succes: false, message: 'Utilisateur introuvable' })
    }
    next()
  } catch (err) {
    return res.status(401).json({ succes: false, message: 'Token invalide' })
  }
}

exports.autoriser = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ succes: false, message: `Accès refusé` })
  }
  next()
}