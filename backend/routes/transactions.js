 
const express = require('express')
const router = express.Router()
const {
  creerTransaction,
  mesTransactions,
  statsTransactions
} = require('../controllers/transactionController')
const { proteger, autoriser } = require('../middleware/auth')

router.post('/', proteger, autoriser('client'), creerTransaction)
router.get('/mes-transactions', proteger, mesTransactions)
router.get('/stats', proteger, autoriser('admin'), statsTransactions)

module.exports = router