const express = require('express')
const router = express.Router()
const { envoyerMessage } = require('../controllers/messageController')
const { proteger } = require('../middleware/auth')

router.post('/', proteger, envoyerMessage)

module.exports = router
