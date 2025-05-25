const router = require('express').Router()
const {
    createRequireMents,
    getSingleUserRequirements,
    getParentsOrTutorsListByuserType,
    updateRequireMents,
    viewRequirementProfile,
    getSingleRequirement,
    validateUser,
    validateUpdatePostRequirement
} = require('../controllers/postRequirementsController')
const auth = require('../../middleware/authentication')

router.get('/get-parents-tutors-list',getParentsOrTutorsListByuserType)

router.use(auth)
router.post('/create-requirement', validateUser ,createRequireMents)
router.patch('/update-requirement',validateUpdatePostRequirement, updateRequireMents)


router.get('/get-single-user-requirements',getSingleUserRequirements)
router.get('/view-requirement-profile',viewRequirementProfile)
router.get('/get-single-requirement',getSingleRequirement)

module.exports = router