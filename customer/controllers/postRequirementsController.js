const asyncWrapper = require('../../middleware/asyncWrapper')
const postRequireMentsModel = require('../../models/postRequirementsModel')
const customConstants = require('../../config/constants.json');
const walletTransactionsModel = require('../../models/walletTransactionsModel');
const usersModel = require('../../models/usersModel');
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
    req.body.userType = req.user.userType
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
    let userDetails = ["parent","student"].includes(userType) ? await postRequireMentsModel.find({userType:userType}).populate({ path: 'userId', select: '-password' }) : await usersModel.find({userType:userType},{password:0})
    const formattedUserType = userType.charAt(0).toUpperCase() + userType.slice(1) + "s";
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS.replace("User",formattedUserType),
        data:userDetails
    });
})


exports.updateRequireMents = asyncWrapper(async(req,res)=>{
    const {requirementId} = req.query
    const {
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
    req.body.location = {
        currentLocationURL:currentLocationURL,
        mapLocation:mapLocation
    }
    const postRequireMent = await postRequireMentsModel.findByIdAndUpdate(requirementId,req.body)
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_UPDATE_REQUIREMENT
    });
})


exports.viewRequirementProfile = asyncWrapper(async (req, res) => {
    const { requirementId } = req.query
    await postRequireMentsModel.findByIdAndUpdate(
        requirementId,
        { $push: { requirementViewedInfo: req.user._id } },
        { new: true, upsert: true }
    ).populate('userId');

    let walletObject = {
        userId: req.user._id,
        requirementId: requirementId,
        transactionType: 'debit',
        walletCredits: 1,
        userType: req.user.userType,
        status: "success"
    }
    await walletTransactionsModel.create(walletObject)
    const usersDetials = await usersModel.findByIdAndUpdate(
        req.user._id,
        { $inc: { "tutorProfile.wallet": -1 } },
        { new: true }
      );
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS,
        data: usersDetials
    });
})