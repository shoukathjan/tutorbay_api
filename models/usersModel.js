const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const usersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id;
        },
        index: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required.'],
        default: ""
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required.'],
        default: ""
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        default: ""
    },
    userType: {
        type: String,
        enum: ['parent', 'student'],
        default: "parent"
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
    status: {
        type: String,
        enum: ['active', 'deleted', 'blocked'],
        default: "active"
    },
    curriculum: {
        type: String,
        default: ""
    },
    subject: {
        type: String,
        default: ""
    },
    emirates: {
        type: String,
        default: ""
    },
    currentLocationURL: {
        type: String,
        default: ""
    },
    mapLocation: {
        type: Array,
        default: []
    }

}, { timestamps: true });

// JWT Methods
usersSchema.methods.getJWTToken = function () {
    const jwtExpiresInput =  process.env.JWT_EXPIRES_IN;
    return jwt.sign({ userId: this._id }, 'secret', {
        expiresIn: jwtExpiresInput,
    });
};

usersSchema.methods.getJWTTokenExpireDate = async (jwtToken) => {
    const decode = jwt.verify(jwtToken, 'secret');
    return decode;
};

module.exports = mongoose.model('users', usersSchema);
