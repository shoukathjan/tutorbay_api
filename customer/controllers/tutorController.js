const asyncWrapper = require('../../middleware/asyncWrapper');
const tutorsModel = require('../../models/tutorsModel');
const Tutor = require('../models/tutorModel');
const customConstants = require('../../config/constants.json');
const mongoose = require('mongoose');
const { validateUserMobileEmailData, validatePhoneNumber } = require('../../utils/userLoginValidation');
/*
Miidleware function to controller, "createUser"
Mandatory fields -> Name, Company name, Email, Role, Phone ,Password
Funtion to check existence of mandatory fields in payload
If returns True, moves to "next" function , "createUser"
*/
exports.validateTutorRegistration = asyncWrapper(async (req, res, next) => {
  const { firstName,lastName, email, phone, userType, password } = req.body
  if (!firstName ||!lastName || !email || !password || !userType) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_MANDATORY_FIELDS
    });
  }
  if (phone && !await validatePhoneNumber(phone)) {
    return res.status(customConstants.statusCodes.UNPROCESSABLE_STATUS_CODE_FAIL).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_PHONE_NUMBER_VALIDATE
    });
  }
  // if (!['super-admin','parent'].includes(req.user.role)) {
  //   return res.status(customConstants.statusCodes.UNAUTHORIZED).json({
  //     status: customConstants.messages.MESSAGE_FAIL,
  //     message: customConstants.messages.MESSAGE_SESSION_NO_ACCESS_TO_ADD_USER,
  //   });
  // }
  else {
    next()
  }
})

// Create a new tutor
exports.createTutor = asyncWrapper(async (req, res, next) => {
  const tutorDetails = await tutorsModel.findOne({$or:[{phone:req.body.phone},{email:req.body.email}]})
  if (tutorDetails) {
    return res.status(customConstants.statusCodes.DATA_CONFLICAT).json({
      status: customConstants.messages.MESSAGE_FAIL,
      message: customConstants.messages.MESSAGE_TUTOR_EXIST
    })
  }
  else{
    const tutor = new Tutor(req.body);
    const savedTutor = await tutor.save();
    return res.status(customConstants.statusCodes.SUCCESS_STATUS_CODE_CREATED).json({
        status: customConstants.messages.MESSAGE_SUCCESS,
        message: customConstants.messages.MESSAGE_TUTOR_CREATED,
    })
  }
});

// Get all tutors
exports.getAllTutors = asyncWrapper(async (req, res, next) => {
  const tutors = await Tutor.find();
  res.status(200).json({ success: true, data: tutors });
});

// Get a tutor by ID
exports.getTutorById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid tutor ID' });
  }

  const tutor = await Tutor.findById(id);
  if (!tutor) {
    return res.status(404).json({ success: false, message: 'Tutor not found' });
  }

  res.status(200).json({ success: true, data: tutor });
});

// Update a tutor by ID
exports.updateTutor = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid tutor ID' });
  }

  const updatedTutor = await Tutor.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedTutor) {
    return res.status(404).json({ success: false, message: 'Tutor not found' });
  }

  res.status(200).json({ success: true, data: updatedTutor });
});

// Delete a tutor by ID
exports.deleteTutor = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid tutor ID' });
  }

  const deletedTutor = await Tutor.findByIdAndDelete(id);
  if (!deletedTutor) {
    return res.status(404).json({ success: false, message: 'Tutor not found' });
  }

  res.status(200).json({ success: true, message: 'Tutor deleted successfully' });
});
