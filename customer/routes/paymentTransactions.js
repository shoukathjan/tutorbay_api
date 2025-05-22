const router = require('express').Router()

const {
    createPayment,
    paymentWebhook,
    successThePayment
} = require('../controllers/paymentTransactionController')


router.post('/create-payment', createPayment)
router.get('/success',successThePayment)

router.post('/payment-webhook', paymentWebhook)

module.exports = router