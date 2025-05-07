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
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        // required: [true, 'Mobile number is required.'],
        minlength: 10,
        maxlength: 15,
        match: /^[0-9]+$/,
        default: "",
        unique: [true, 'Phone must be unique']
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        default: "",
        unique: [true, 'Email must be unique']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        min: 8,
        max:10
    },    
    status: {
        type: String,
        enum: ['active', 'delete', 'blocked'],
        default: "active"
    },
    highestQualification: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    emirates: {
        type: String,
        required: true
    },
    currentLocationURL: {
        type: String,
        required: true
    },
    mapLocation: {
        type: Array,
        default: [],
        required: false
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
        required: true
    },
    availability: {
        type: [
            {
                days: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    required: true
                },
                startTime: { type: String, required: true },
                endTime: { type: String, required: true }
            }
        ],
        required: true
    },
    expectedFeePerHour: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// JWT Methods
tutorSchema.methods.getJWTToken = function () {
    const jwtExpiresInput = process.env.JWT_EXPIRES_IN;
    return jwt.sign({ userId: this._id }, 'secret', {
        expiresIn: jwtExpiresInput,
    });
};

tutorSchema.methods.getJWTTokenExpireDate = async (jwtToken) => {
    const decode = jwt.verify(jwtToken, 'secret');
    return decode;
};

module.exports = mongoose.model('tutors', tutorSchema);
