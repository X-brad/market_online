const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const { proteger, autoriser } = require('../middleware/auth')
const Temoignage = require('../models/Temoignage')

const DOSSIER_PHOTOS = path.join(__dirname, '..', 'uploads', 'temoignages')
fs.mkdirSync(DOSSIER_PHOTOS, { recursive: true })

const TAILLE_FINALE_PX = 500

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return cb(new Error('Format d\'image non supporté (jpeg, png, webp ou gif uniquement)'))
    }
    cb(null, true)
  }
})

async function traiterPhoto(buffer, nomFichier) {
  const metadata = await sharp(buffer).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('Image illisible ou corrompue')
  }
  await sharp(buffer)
    .rotate()
    .resize(TAILLE_FINALE_PX, TAILLE_FINALE_PX, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 85 })
    .toFile(path.join(DOSSIER_PHOTOS, nomFichier))
}

// GET /api/temoignages — Liste des témoignages (public, utilisée par la home et l'admin)
router.get('/', async (req, res) => {
  try {
    const temoignages = await Temoignage.find().sort({ createdAt: -1 })
    res.json({ succes: true, temoignages })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

// POST /api/temoignages — Ajouter un témoignage (admin)
router.post('/', proteger, autoriser('admin'), uploadPhoto.single('photo'), async (req, res) => {
  try {
    const { nomClient, texte } = req.body
    const temoignage = await Temoignage.create({ nomClient, texte })

    if (req.file) {
      const nomFichier = `${temoignage._id}-${Date.now()}.jpg`
      await traiterPhoto(req.file.buffer, nomFichier)
      temoignage.photoUrl = `/uploads/temoignages/${nomFichier}`
      await temoignage.save()
    }

    res.status(201).json({ succes: true, temoignage })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
})

// PUT /api/temoignages/:id — Modifier un témoignage (admin)
router.put('/:id', proteger, autoriser('admin'), uploadPhoto.single('photo'), async (req, res) => {
  try {
    const temoignage = await Temoignage.findById(req.params.id)
    if (!temoignage) return res.status(404).json({ succes: false, message: 'Témoignage introuvable' })

    const { nomClient, texte } = req.body
    if (nomClient !== undefined) temoignage.nomClient = nomClient
    if (texte !== undefined) temoignage.texte = texte

    if (req.file) {
      const nomFichier = `${temoignage._id}-${Date.now()}.jpg`
      await traiterPhoto(req.file.buffer, nomFichier)
      const ancienPhotoUrl = temoignage.photoUrl
      temoignage.photoUrl = `/uploads/temoignages/${nomFichier}`
      if (ancienPhotoUrl) {
        fs.unlink(path.join(DOSSIER_PHOTOS, path.basename(ancienPhotoUrl)), () => {})
      }
    }

    await temoignage.save()
    res.json({ succes: true, temoignage })
  } catch (err) {
    res.status(400).json({ succes: false, message: err.message })
  }
})

// DELETE /api/temoignages/:id — Supprimer un témoignage (admin)
router.delete('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const temoignage = await Temoignage.findById(req.params.id)
    if (!temoignage) return res.status(404).json({ succes: false, message: 'Témoignage introuvable' })

    if (temoignage.photoUrl) {
      fs.unlink(path.join(DOSSIER_PHOTOS, path.basename(temoignage.photoUrl)), () => {})
    }
    await Temoignage.findByIdAndDelete(req.params.id)

    res.json({ succes: true, message: 'Témoignage supprimé' })
  } catch (err) {
    res.status(500).json({ succes: false, message: err.message })
  }
})

module.exports = router
