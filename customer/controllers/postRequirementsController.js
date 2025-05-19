const asyncWrapper = require('../../middleware/asyncWrapper')
const postRequireMentsModel = require('../../models/postRequirementsModel')
const customConstants = require('../../config/constants.json');
const tutorsModel = require('../../models/tutorsModel');
exports.createRequireMents = asyncWrapper(async (req, res) => {
    const {
        userType,
        subject,
        curriculum,
        grade,
        emirateId,
        currentLocationURL,
        mapLocation,
        modeOfTeaching,
        days,
        preferredTime,
        expectedFee,
        additionalNotes,
        status
    } = req.body
    req.body.userId = req.user._id
    req.body.location = {
        currentLocationURL:currentLocationURL,
        mapLocation:mapLocation
    }
    const postRequireMent = await postRequireMentsModel.create(req.body)
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_CREATED).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_CREATE_REQUIREMENT
    });
});

exports.getSingleUserRequirements = asyncWrapper(async (req, res) => {
    const { userId } = req.query
    const requirementDetails = await postRequireMentsModel.find({ userId: userId }).lean()
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_SINGLE_USER_REQUIREMENTS,
        data:requirementDetails
    });
})

exports.getParentsOrTutorsListByuserType = asyncWrapper(async(req,res)=>{
    const {userType} = req.query
    let userDetails = ["parent","student"].includes(userType) ? await postRequireMentsModel.find({userType:userType}) : await tutorsModel.find({})
    const formattedUserType = userType.charAt(0).toUpperCase() + userType.slice(1) + "s";
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS.replace("User",formattedUserType),
        data:userDetails
    });
})