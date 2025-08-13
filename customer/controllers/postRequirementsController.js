const asyncWrapper = require('../../middleware/asyncWrapper')
const postRequireMentsModel = require('../../models/postRequirementsModel')
const customConstants = require('../../config/constants.json');
const walletTransactionsModel = require('../../models/walletTransactionsModel');
const usersModel = require('../../models/usersModel');
const moment = require('moment');
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
    let userDetails = ["parent","student"].includes(userType) ? 
    await postRequireMentsModel.find({userType:userType}).populate({ path: 'userId', select: '-password' }) : 
    await usersModel.find({userType:userType},{password:0})
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

exports.getSingleRequirement = asyncWrapper(async(req,res)=>{
    const{requirementId} = req.query
    const requirementDetails = await postRequireMentsModel.findById(requirementId).populate({path:"userId",select:"-password"})
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_SINGLE_REQUIREMENT_DETAILS,
        data: requirementDetails
    });
})

exports.getMatchedprofiles = asyncWrapper(async(req,res)=>{
    const userId = req.user._id
    const userDetails = await usersModel.findById(userId)
    const matchedRequirements = await postRequireMentsModel.aggregate([
        {
            $match:{
                emirateId: userDetails?.tutorProfile?.emirateId,
                subject: userDetails?.tutorProfile?.subject,
                grade: userDetails?.tutorProfile?.grade
            }
        }
    ])
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_SINGLE_REQUIREMENT_DETAILS,
        data: matchedRequirements
    })
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
        walletCredits: 4,
        userType: req.user.userType,
        status: "success"
    }
    await walletTransactionsModel.create(walletObject)
    const usersDetials = await usersModel.findByIdAndUpdate(
        req.user._id,
        { $inc: { "wallet": -1 } },
        { upsert:true, new: true }
      );
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS,
        data: usersDetials
    });
})

exports.viewRequirementProfileForTutor = asyncWrapper(async (req, res) => {
    const { requirementId, userId } = req.query;

    // 1. Get the requirement to check previous view
    const requirement = await postRequireMentsModel.findById(requirementId)
        .populate('userId');

    const viewedRecord = requirement?.requirementViewedInfo?.find(
        v => v.userId  === userId
    );

    const now = moment();
    const within3Days = viewedRecord && moment(viewedRecord.viewedDate).isAfter(moment().subtract(3, 'days'));

    // 2. If viewed within last 3 days → skip wallet deduction
    if (within3Days) {
        const userDetails = await usersModel.findById(requirement?.userId?._id);
        return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
            status: customConstants.messages.MESSAGE_SUCCESS,
            message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS,
            data: userDetails
        });
    }

    // 3. Prepare wallet transaction object
    const walletObject = {
        userId: req.user._id,
        requirementId,
        transactionType: 'debit',
        walletCredits: 4,
        userType: req.user.userType,
        status: "success"
    };
    await walletTransactionsModel.create(walletObject);

    // 4. Deduct wallet credits
    const updatedUser = await usersModel.findByIdAndUpdate(
        req.user._id,
        { $inc: { wallet: -4 } },
        { upsert: true, new: true }
    );

    // 5. Update viewedDate in requirementViewedInfo
    if (viewedRecord) {
        // Update only the viewedDate for existing entry
        await postRequireMentsModel.updateOne(
            { _id: requirementId, "requirementViewedInfo.userId": userId },
            { $set: { "requirementViewedInfo.$.viewedDate": now.toDate() } }
        );
    } else {
        // Add new viewed record
        await postRequireMentsModel.findByIdAndUpdate(
            requirementId,
            {
                $push: {
                    requirementViewedInfo: {
                        userId,
                        viewedDate: now.toDate()
                    }
                }
            },
            { new: true, upsert: true }
        );
    }
    const userDetails = await usersModel.findById(requirement?.userId?._id);
    // 6. Response
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_GET_PARENTS_OR_TUTORS_DETAILS,
        data: userDetails
    });
});
