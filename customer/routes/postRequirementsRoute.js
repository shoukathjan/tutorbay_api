const router = require('express').Router()
const {
    createRequireMents,
    getSingleUserRequirements,
    getParentsOrTutorsListByuserType
} = require('../controllers/postRequirementsController')
const auth = require('../../middleware/authentication')

router.use(auth)
router.post('/create-requirement',createRequireMents)

router.get('/get-single-user-requirements',getSingleUserRequirements)
router.get('/get-parents-tutors-list',getParentsOrTutorsListByuserType)

module.exports = router