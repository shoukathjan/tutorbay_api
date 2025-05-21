const router = require('express').Router()
const {
    createRequireMents,
    getSingleUserRequirements,
    getParentsOrTutorsListByuserType,
    updateRequireMents,
    viewRequirementProfile
} = require('../controllers/postRequirementsController')
const auth = require('../../middleware/authentication')

router.get('/get-parents-tutors-list',getParentsOrTutorsListByuserType)

router.use(auth)
router.post('/create-requirement',createRequireMents)
router.patch('/update-requirement',updateRequireMents)


router.get('/get-single-user-requirements',getSingleUserRequirements)
router.get('/view-requirement-profile',viewRequirementProfile)

module.exports = router