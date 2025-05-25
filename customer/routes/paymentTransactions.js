const router = require('express').Router()

const {
    createPayment,
    paymentWebhook,
    successThePayment,
    validateUser
} = require('../controllers/paymentTransactionController')


router.post('/create-payment', validateUser, createPayment)
router.get('/success',successThePayment)

router.post('/payment-webhook', paymentWebhook)

module.exports = router