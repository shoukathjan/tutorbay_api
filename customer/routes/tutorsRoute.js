const express = require('express');
const router = express.Router();
const {
    validateTutorRegistration,
    createTutor,
    getAllTutors,
    getTutorById,
    updateTutor,
    deleteTutor,
} = require('../controllers/tutorController');

// CRUD routes
router.post('/create-tutor', validateTutorRegistration,createTutor);
router.post('/login',validateLoginProcess, loginUser)
router.get('/get-all-tutors', getAllTutors);
router.get('/:tutorId', getTutorById);
router.put('/:tutorId', updateTutor);
router.delete('/:tutorId', deleteTutor);

module.exports = router;
