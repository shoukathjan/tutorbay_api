const router = require('express').Router()

const auth = require('../../middleware/authentication')
const {
    createPayment,
    paymentWebhook,
    successThePayment
} = require('../controllers/paymentTransactionController')


router.post('/create-payment', createPayment)
router.get('/success-payment',successThePayment)
// router.use(auth)
router.post('/payment-webhook', paymentWebhook)

module.exports = router