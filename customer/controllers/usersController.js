// const axios = require('axios');
const usersModel = require('../../models/usersModel');
const asyncWrapper = require('../../middleware/asyncWrapper');
const customConstants = require('../../config/constants.json');
const sessionsModel = require('../../models/sessionsModel');
const { hashPwd, comparePassword, twelveWeeksSales } = require('../../utils/helpers');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose')

const { validateUserMobileEmailData, validatePhoneNumber } = require('../../utils/userLoginValidation');
const tutorsModel = require('../../models/tutorsModel');
const { generateToken } = require('../../utils/utilsFunctions');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.googleLogin = asyncWrapper(async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const { sub: googleId, email, given_name, family_name, picture } = payload;

  let user = await usersModel.findOne({ googleId });

  if (!user) {
    // Create new user with basic info
    user = await usersModel.create({
      googleId,
      email,
      registrationMethod: 'google',
      firstName: given_name,
      lastName: family_name,
      profilePicture: picture,
    });
  }

  const jwtToken = generateToken(user);

  res.status(200).json({
    message: 'Google sign-in successful',
    token: jwtToken,
    profileComplete: !!user.userType && !!user.firstName,
  });

})

/*
Miidleware function to controller, "createUser"
Mandatory fields -> Name, Company name, Email, Role, Phone ,Password
Funtion to check existence of mandatory fields in payload
If returns True, moves to "next" function , "createUser"
*/
exports.validateUserRegistration = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, phone, userType, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !password || !userType) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_MANDATORY_FIELDS,
    });
  }
  if (!await validatePhoneNumber(phone)) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NUMBER_VALIDATE,
    });
  }
  let validatedData = validateUserMobileEmailData({ mobileEmail: email });
  if (validatedData.error) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_REQUEST_BODY_ERROR,
      error: validatedData.error.details,
    });
  }
  if (!['tutor', 'parent', 'student'].includes(userType)) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_WRONG_FIELDS,
    });
  }
  next();
});

// Create user (manual registration)
exports.createUser = asyncWrapper(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    userType,
    password,
    role,
    registrationMethod,
    highestQualification,
    nationality,
    emiratesTutor,
    currentLocationURLTutor,
    mapLocationTutor,
    hasPrivateTutorLicense,
    licenseDocumentUrl,
    modeOfTeaching,
    availability,
    expectedFeePerHour,
    curriculum,
    subject,
    emirates,
    currentLocationURL,
    mapLocation,
  } = req.body;

  // Check for existing user
  let existingUser = await usersModel.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res.status(customConstants.statusCodes.DATA_CONFLICAT).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message:
        existingUser.email === email
          ? customConstants.messages.MESSAGE_USER_EXIST
          : customConstants.messages.MESSAGE_PHONE_EXISTS,
    });
  }

  const userData = {
    firstName,
    lastName,
    email,
    phone,
    userType,
    password: await hashPwd(password),
    registrationMethod: registrationMethod,
    status: 'active',
    role: role || 'manager',
  };

  let createdUser;
  if (userType === 'tutor') {
    userData.tutorProfile = {
      highestQualification,
      nationality,
      registrationMethod: registrationMethod,
      emirates: emiratesTutor,
      location: {
        currentLocationURL,
        mapLocation,
      },
      hasPrivateTutorLicense,
      licenseDocumentUrl,
      modeOfTeaching,
      availability,
      expectedFeePerHour,
    };
    // createdUser = await tutorsModel.create(userData);
  } else if (['parent', 'student'].includes(userType)) {
    userData.parentStudentProfile = {
      curriculum,
      subject,
      emirates,
      location: {
        currentLocationURL,
        mapLocation,
      },
    };
    // createdUser = await usersModel.create(userData);
  }
  createdUser = await usersModel.create(userData);

  const userObject = createdUser.toObject();
  delete userObject.password;

  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_CREATED).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message:
      userType === 'tutor'
        ? customConstants.messages.MESSAGE_TUTOR_CREATED
        : customConstants.messages.MESSAGE_USER_CREATED,
    data: userObject,
  });
});


/**
  *Middleware function to check whether account and user are active before proceeding to delete
  *If middleware is passed, Function call is passed to update status of user to "Deleted".
  *If successful, returns updated record.
*/
exports.middlewareToDeleteUser = asyncWrapper(async (req, res, next) => {
  if (req.user.status === 'deleted') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_USER_ALREADY_DELETED,
    });
  }
  if (!['merchant', 'super-admin'].includes(req.user.role)) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_SESSION_NO_ACCESS_TO_DELETE_USER,
    });
  }
  next()
}

)


/** 
  *Function to delete user 
  *PATCH route to update the status of user to "deleted"
  *Route to be provided only to Admin; Not accessible by user by self.
   *If successful, returns updated record.

*/
exports.updateUserStatus = asyncWrapper(async (req, res) => {
  // const deactivateUser = await usersModel.findByIdAndUpdate(req.params.userId, { $set: { status: 'deleted', updatedBy: req.user_id } }, { new: true });
  // delete deactivateUser.password;
  let userDetails
  const { status } = req.body
  if (status === 'delete') {
    userDetails = await usersModel.findByIdAndUpdate(req.params.userId, { $set: { status: 'deleted', updatedBy: req.user_id } }, { new: true });
    delete userDetails.password
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
      status: customConstants.messages.MESSAGE_SUCCESS,
      message: customConstants.messages.MESSAGE_USER_DELETED,
    })
  }
  else if (status === 'active') {
    userDetails = await usersModel.findByIdAndUpdate(req.params.userId, { $set: { status: 'active', updatedBy: req.user_id } }, { new: true });
    delete userDetails.password
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
      status: customConstants.messages.MESSAGE_SUCCESS,
      message: customConstants.messages.MESSAGE_USER_ACTIVATED,
    })
  }
  // Return success response
  // return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
  //   status: customConstants.messages.MESSAGE_SUCCESS,
  //   message: customConstants.messages.MESSAGE_USER_DELETED,
  //   data: deactivateUser,
  // });
})

/**
 * Function to get the details of the spectific user
 * Input -> @params User Id 
 
 */
exports.getUserDetails = asyncWrapper(async (req, res) => {

  const user = await usersModel.findOne({ _id: req.params.userId }, { password: 0 }).lean()
  // Return success response
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_USER_DETAILS,
    data: user,
  });

})

/**
 * Function to get all users of account
 *@params "accountId" 
 * 
 */
exports.getAllUsers = asyncWrapper(async (req, res) => {
  // const users = await usersModel.find({ accountId: req.params.accountId, role:{$eq:req.user.role === "super-admin"} }, { password: 0 });
  console.log('req.user.role:===', req.user.role)
  const users = await usersModel.find(
    {
      accountId: req.params.accountId,
      role: req.user.role === "super-admin" ? { $in: ["super-admin", "admin", "merchant"] } : req.user.role === "merchant" ? { $in: ["manager", "merchant"] } : { $eq: "manager" }
    },
    { password: 0 }
  );

  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_ALL_USERS_DETAILS,
    data: {
      users
    },
  });
})



/**
 * Middleware function to check status of user before updating details
 * If passed , Funnction call will be passed to next actual function to save the updates.
 */
exports.middlewareUpdateUserDetails = asyncWrapper(async (req, res, next) => {
  const userStatusCheck = await usersModel.findById(req.params.userId);
  console.log('userStatusCheck', userStatusCheck)
  if (userStatusCheck.status === 'deleted') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_USER_STATUS_IS_DELETED,
    });
  }
  next()
})

/**
 * Function to update details of user
 * * If user matches with main account, it gets changed in main account too. 
 * Or else, It changes in respective user.
 * @params userId
 */
exports.updateUserDetails = asyncWrapper(async (req, res) => {
  const user = await usersModel.findById(req.params.userId).lean()
  var updateAccount;
  var updateUser;
  if (user) {
    updateUser = await usersModel.findByIdAndUpdate(req.params.userId, { $set: { ...req.body, updatedBy: req.user._id } }, { new: true });
  }
  const userObject = updateUser.toObject();
  delete userObject.password;
  console.log("updateUser-delete password", userObject);
  // Return success response
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_USER_DETAILS_UPDATED,
    data: {
      userObject
    }
  });

})


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
  const { mobileEmail, password, loginMethod } = req.body;
  if ((!mobileEmail || !password) && loginMethod === "manual") {
    return res.status(customConstants.statusCodes.BAD_REQUEST).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_FIELDS_MANDATORY,
    });
  }
  let validatedUserMobileAndEmailData = validateUserMobileEmailData({ mobileEmail });
  if (validatedUserMobileAndEmailData.error) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      message: customConstants.messages.MESSAGE_REQUEST_BODY_ERROR,
      status: customConstants.messages.MESSAGE_FAIL,
      error: validatedUserMobileAndEmailData.error.details,
    });
  }
  let user = await usersModel.findOne({ $or: [{ phone: mobileEmail }, { email: mobileEmail }] });
  if (!user) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NOT_EXISTS,
    });
  }
  if (user.registrationMethod === 'google') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_USE_GOOGLE_LOGIN,
    });
  }
  if (user.status === 'deleted') {
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
exports.loginUser = asyncWrapper(async (req, res) => {
  const { mobileEmail, userType } = req.body;
  let user_details = {};
  let user, userData, jwtToken, jwtTokenExpires;

  user = await usersModel.findOne(
    { $or: [{ phone: mobileEmail }, { email: mobileEmail }] },
    { password: 0 }
  );
  userData = await usersModel.findOne({ $or: [{ phone: mobileEmail }, { email: mobileEmail }] });
  if (!userData) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NOT_EXISTS,
    });
  }
  jwtToken = await userData.getJWTToken();
  jwtTokenExpires = await userData.getJWTTokenExpireDate(jwtToken);
  req.body.userId = userData._id;
  user_details.userDetails = user.toObject();
  req.body.accessToken = jwtToken;
  req.body.expirationTime = jwtTokenExpires.exp;
  const sessionDetails = await sessionsModel.create(req.body);
  user_details.sessionDetails = sessionDetails;

  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_USER_LOGIN,
    data: user_details,
  });
});





/*
Miidleware function to validate user and password
Mandatory fields -> Phone and Password
Funtion to check 
  1.Mandatorys status of Account, 
  2.Validation of credentials, password
If returns True, moves to "next" function , "updatePassword"
*/
exports.middlewareToUpdatePassword = asyncWrapper(async (req, res, next) => {
  // console.log("Rweq", req.body)
  const { userId } = req.params
  const { currentPassword, newPassword } = req.body;

  const user = await usersModel.findById(userId).populate('accountId')
  // If user not found
  if (!user) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NOT_EXISTS,
    });
  }
  // if (user.accountId.status === 'in-progress') {
  //   return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
  //     status: customConstants.messages.MESSAGE_FAIL,
  //     message: customConstants.messages.MESSAGE_PREVENT_LOGIN_ACCOUNT_IN_PROGRESS,
  //   });
  // }
  if (user.accountId.status === 'deleted' || user.status === 'deleted') {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PREVENT_LOGIN_ACCOUNT_DELETED,
    });
  }

  console.log(currentPassword, "comparePasswordResult");
  console.log(user.password, "user.password");
  // Compare password 
  const comparePasswordResult = await comparePassword(currentPassword, user.password);
  console.log(comparePasswordResult, "comparePasswordResult");

  // If password does not match
  if (!comparePasswordResult) {
    return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_WRONG_CURRENT_PASSWORD,
    });
  }
  next()

})

/**
 * Update the user password.
 * If user matches with main account, it gets changed in main account too. 
 * Or else, It changes in respective user.
 * @params userId
 */

exports.updatePassword = asyncWrapper(async (req, res) => {

  const { userId } = req.params;
  const user = await usersModel.findById(req.params.userId).lean()

  const { currentPassword, newPassword } = req.body;
  let updatedPassword = await hashPwd(newPassword)
  var updateAccountPassword;
  var updateUserPassword
  if (user) {
    updateUserPassword = await usersModel.findByIdAndUpdate(userId, { password: updatedPassword }, { new: true, runValidators: true })
  }
  return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_SUCCESS).json({
    status: customConstants.messages.MESSAGE_SUCCESS,
    message: customConstants.messages.MESSAGE_PASSWORD_UPDATED,
  });
})