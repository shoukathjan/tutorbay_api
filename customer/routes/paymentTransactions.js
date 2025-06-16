const router = require('express').Router()

const auth = require('../../middleware/authentication')
const {
    createPayment,
    paymentWebhook,
    successThePayment,
    getTransactions
} = require('../controllers/paymentTransactionController')


router.post('/create-payment', createPayment)
router.get('/success-payment',successThePayment)
// router.use(auth)
router.post('/payment-webhook', paymentWebhook)

router.get('/wallet-transactions',getTransactions)

module.exports = router