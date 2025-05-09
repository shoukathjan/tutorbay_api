const router = require('express').Router()
const {
    createRequireMents,
    getSingleUserRequirements
} = require('../controllers/postRequirementsController')
const auth = require('../../middleware/authentication')


router.post('/create-requirement',createRequireMents)

router.get('/get-single-user-requirements',getSingleUserRequirements)

module.exports = router