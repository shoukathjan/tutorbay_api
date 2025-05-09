const asyncWrapper = require('../../middleware/asyncWrapper')
const postRequireMentsModel = require('../../models/postRequirementsModel')
const customConstants = require('../../config/constants.json')
exports.createRequireMents = asyncWrapper(async (req, res) => {
    const {
        userId,
        userType,
        subject,
        curriculum,
        grade,
        emirates,
        location: {
            currentLocationURL,
            mapLocation
        },
        modeOfTeaching,
        days,
        preferredTime,
        expectedFee,
        additionalNotes,
        status
    } = req.body
    const postRequireMent = await postRequireMentsModel.create(req.body)
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_CREATED).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_CREATE_REQUIREMENT
    });
});

exports.getSingleUserRequirements = asyncWrapper(async (req, res) => {
    const { userId } = req.query
    const requirementDetails = await postRequireMentsModel.find({ userId: userId }).lean()
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_CREATED).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_SINGLE_USER_REQUIREMENTS
    });
})