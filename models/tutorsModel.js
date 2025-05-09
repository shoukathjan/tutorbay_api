const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const tutorSchema = new mongoose.Schema({
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id;
        },
        index: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        index:true,
        default:null
    },
    status: {
        type: String,
        enum: ['active', 'delete', 'blocked'],
        default: "active"
    },
    highestQualification: {
        type: String,
        // required: true
    },
    nationality: {
        type: String,
        // required: true
    },
    emirates: {
        type: String,
        // required: true
    },
    location: {
        currentLocationURL: {
            type: String,
            default: '',
        },
        mapLocation: {
            type: [{ lat: { type: Number }, lng: { type: Number } }],
            default: [],
        },
    },
    hasPrivateTutorLicense: {
        type: Boolean,
        default: false
    },
    licenseDocumentUrl: {
        type: String,
        // required: function () { return this.hasPrivateTutorLicense; }
    },
    modeOfTeaching: {
        type: String,
        enum: ['Online', 'Offline', 'Both'],
        // required: true
    },
    availability: {
        type: [
            {
                days: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    // required: true
                },
                startTime: { type: String},
                endTime: { type: String}
            }
        ],
        // required: true
    },
    expectedFeePerHour: {
        type: Number,
        // required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('tutors', tutorSchema);
