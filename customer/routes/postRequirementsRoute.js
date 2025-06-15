const router = require('express').Router()
const {
    createRequireMents,
    getSingleUserRequirements,
    getParentsOrTutorsListByuserType,
    updateRequireMents,
    viewRequirementProfile,
    getSingleRequirement,
    getMatchedprofiles
} = require('../controllers/postRequirementsController')
const auth = require('../../middleware/authentication')

router.get('/get-parents-tutors-list',getParentsOrTutorsListByuserType)

router.use(auth)
router.post('/create-requirement',createRequireMents)
router.patch('/update-requirement',updateRequireMents)


router.get('/get-single-user-requirements',getSingleUserRequirements)
router.get('/view-requirement-profile',viewRequirementProfile)
router.get('/get-single-requirement',getSingleRequirement)
router.get('/get-matched-requirements', getMatchedprofiles)

module.exports = router