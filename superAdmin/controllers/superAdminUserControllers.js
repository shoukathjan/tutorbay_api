const usersModel = require('../../models/usersModel')
const asyncWrapper = require('../../middleware/asyncWrapper')
const { validateUserMobileEmailData, validatePhoneNumber } = require('../../utils/userLoginValidation')
const { hashPwd, comparePassword } = require('../../utils/helpers')
const customConstants = require('../config/customConstants.json')
const sessionsModel = require('../../models/sessionsModel');

/*
Miidleware function to controller, "loginUser"
Mandatory fields -> Phone and Password
Funtion to check 
  1.Existence of mandatory fields, 
  2.Mandatorys status of Account, 
  3.Validation of credentials, password
If returns True, moves to "next" function , "loginUser"
*/

exports.validateLoginProcess = asyncWrapper(async (req, res, next) => {
  console.log("Req Body:", req.body);

  const { mobileEmail, password } = req.body;

  if (!mobileEmail || !password) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_FIELDS_MANDATORY,
    });
  }

  const validatedUserMobileAndEmailData = validateUserMobileEmailData(req.body);
  if (validatedUserMobileAndEmailData.error) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      message: customConstants.messages.MESSAGE_REQUEST_BODY_ERROR,
      status: customConstants.messages.MESSAGE_FAIL,
      error: validatedUserMobileAndEmailData.error.details
    });
  }

  const user = await usersModel.findOne({
    $or: [{ phone: mobileEmail }, { email: mobileEmail }]
  }).populate('accountId');

  if (!user) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NOT_EXISTS,
    });
  }

  // if (user.accountId.accountType !== 'super-admin' || user.accountId.accountType !== 'admin') {
  //   return res.status(customConstants.statusCodes.FORBIDDEN).json({
  //     status: customConstants.messages.MESSAGE_FAIL,
  //     message: customConstants.messages.MESSAGE_SUPER_ADMIN_ENTRY,
  //   });
  // }

  if (user.accountId.status === 'in-progress') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PREVENT_LOGIN_ACCOUNT_IN_PROGRESS,
    });
  }

  if (user.accountId.status === 'delete' || user.status === 'delete') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PREVENT_LOGIN_ACCOUNT_DELETED,
    });
  }

  const comparePasswordResult = await comparePassword(password, user.password);

  if (!comparePasswordResult) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_WRONG_PASSWORD,
    });
  }

  next();
});

/*
If middleware returns True, this function create session with valid JWT token
Mandatory fields -> Phone and Password 
*/
exports.superAdminLogin = asyncWrapper(async (req, res) => {
  const { mobileEmail, password } = req.body;
  let user_details = {};
  // Find user by email or phone
  const user = await usersModel.findOne({ $or: [{ phone: mobileEmail }, { email: mobileEmail }] }, { _id: 0, password: 0 });
  const userData = await usersModel.findOne({ $or: [{ phone: mobileEmail }, { email: mobileEmail }] });

  user_details.userDetails = user.toObject();

  // Generate JWT token
  const jwtToken = await userData.getJWTToken();
  const jwtTokenExpires = await userData.getJWTTokenExpireDate(jwtToken);

  // Create session
  req.body.accessToken = jwtToken;
  req.body.expirationTime = jwtTokenExpires.exp;
  req.body.userId = userData._id;
  req.body.accountId = userData.accountId;

  const sesssionDetails = await sessionsModel.create(req.body);
  user_details.sesssionDetails = sesssionDetails;

  // Return success response
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_USER_LOGIN,
    data: user_details,
  });


});


exports.getAllUsers = asyncWrapper(async(req,res)=>{
  const allUsers = await usersModel.find({userType:{$ne:"super-admin"}})
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_ALL_USERS_DETAILS,
    data: allUsers,
  });
})

exports.updateUserStatus = asyncWrapper(async(req,res)=>{
  const {userId, status} = req.query
  const statusMap = {
    active: "active",
    delete: "delete",
    block: "block",
  };
  
  let userStatus = statusMap[status] || "in-progress";
  
  await usersModel.findByIdAndUpdate(userId,{status: userStatus},{new:true})
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: `Account ${userStatus === "active" ? "activated" : userStatus+'ed'} successfully.`
  });
})