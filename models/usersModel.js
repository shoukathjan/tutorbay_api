
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Users Schema
const usersSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            default: function () {
                return this._id;
            },
            index: true,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            // trim: true,
            // minlength: [2, 'First name must be at least 2 characters'],
            // maxlength: [50, 'First name cannot exceed 50 characters'],
            default: '',
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            // trim: true,
            // minlength: [2, 'Last name must be at least 2 characters'],
            // maxlength: [50, 'Last name cannot exceed 50 characters'],
            default: '',
        },
        phone: {
            type:String,
            required: [
                function () {
                    return this.registrationMethod === 'manual';
                },
                'Password is required for manual registration',
            ],
            // match: [/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits'],
            // minlength: [10, 'Phone number must be at least 10 digits'],
            // maxlength: [15, 'Phone number cannot exceed 15 digits'],
            index: { unique: true },
            default: '',
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            index: { unique: true },
            default: '',
        },
        password: {
            type: String,
            required: [
                function () {
                    return this.registrationMethod === 'manual';
                },
                'Password is required for manual registration',
            ],
            // minlength: [6, 'Password must be at least 6 characters'],
            // select: false,
            default: '',
        },
        googleId: {
            type: String,
            sparse: true,
            default: null,
        },
        registrationMethod: {
            type: String,
            enum: {
                values: ['manual', 'google'],
                message: '{VALUE} is not a valid registration method',
            },
            required: [true, 'Registration method is required'],
            default: 'manual',
        },
        userType: {
            type: String,
            enum: {
                values: ['tutor', 'parent', 'student', 'admin'],
                message: '{VALUE} is not a valid user type',
            },
            required: [true, 'User type is required'],
            default: 'parent',
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'deleted', 'blocked'],
                message: '{VALUE} is not a valid status',
            },
            default: 'active',
        },
        parentStudentProfile: {
            type: {
                curriculum: {
                    type: String,
                    enum: {
                        values: ['British', 'American', 'IB', 'CBSE', 'Other'],
                        message: '{VALUE} is not a valid curriculum',
                    },
                    //   required: [true, 'Curriculum is required for parents and students'],
                    default: '',
                },
                subject: {
                    type: String,
                    //   required: [true, 'Subject is required for parents and students'],
                    //   trim: true,
                    //   maxlength: [100, 'Subject cannot exceed 100 characters'],
                    default: '',
                },
                emirates: {
                    type: String,
                    //   enum: {
                    //     values: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
                    //     message: '{VALUE} is not a valid emirate',
                    //   },
                    //   required: [true, 'Emirate is required for parents and students'],
                    default: '',
                    index: true,
                },
                location: {
                    currentLocationURL: {
                        type: String,
                        // required: [true, 'Location URL is required for parents and students'],
                        // match: [/^https:\/\/maps\.google\.com/, 'Invalid Google Maps URL'],
                        default: '',
                    },
                    mapLocation: {
                        type: [{ lat: { type: Number, required: true }, lng: { type: Number, required: true } }],
                        // required: [true, 'Map location is required for parents and students'],
                        // validate: {
                        //   validator: (arr) => arr.length === 1,
                        //   message: 'Exactly one map location is required',
                        // },
                        default: [],
                    },
                },
            },
            // required: function () {
            //     return this.userType === 'parent' || this.userType === 'student';
            // },
        },
        tutorProfile: {
            type: {
                highestQualification: {
                    type: String,
                    //   required: [true, 'Highest qualification is required for tutors'],
                    //   trim: true,
                    //   maxlength: [100, 'Qualification cannot exceed 100 characters'],
                    default: '',
                },
                nationality: {
                    type: String,
                    //   required: [true, 'Nationality is required for tutors'],
                    //   trim: true,
                    //   maxlength: [50, 'Nationality cannot exceed 50 characters'],
                    default: '',
                },
                emirates: {
                    type: String,
                    //   enum: {
                    //     values: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
                    //     message: '{VALUE} is not a valid emirate',
                    //   },
                    //   required: [true, 'Emirate is required for tutors'],
                    default: '',
                    index: true,
                },
                location: {
                    currentLocationURL: {
                        type: String,
                        // required: [true, 'Location URL is required for tutors'],
                        // match: [/^https:\/\/maps\.google\.com/, 'Invalid Google Maps URL'],
                        default: '',
                    },
                    mapLocation: {
                        type: [{ lat: { type: Number }, lng: { type: Number } }],
                        // required: [true, 'Map location is required for tutors'],
                        // validate: {
                        //   validator: (arr) => arr.length === 1,
                        //   message: 'Exactly one map location is required',
                        // },
                        default: [],
                    },
                },
                hasPrivateTutorLicense: {
                    type: Boolean,
                    //   required: [true, 'License status is required for tutors'],
                    default: false,
                },
                licenseDocumentUrl: {
                    type: String,
                    //   required: [true, 'License document URL is required for tutors'],
                    //   match: [/^https?:\/\/.+\.pdf$/, 'Invalid PDF URL for license document'],
                    default: '',
                },
                modeOfTeaching: {
                    type: String,
                    enum: {
                        values: ['Online', 'In-Person', 'Both'],
                        message: '{VALUE} is not a valid teaching mode',
                    },
                    //   required: [true, 'Mode of teaching is required for tutors'],
                    default: 'Both',
                },
                availability: {
                    type: [
                        {
                            days: {
                                type: String,
                                enum: {
                                    values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                    message: '{VALUE} is not a valid day',
                                },
                                // required: true,
                            },
                            startTime: {
                                type: String,
                                // required: true,
                                // match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Invalid start time format (e.g., 10:00 AM)'],
                            },
                            endTime: {
                                type: String,
                                // required: true,
                                // match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Invalid end time format (e.g., 2:00 PM)'],
                            },
                        },
                    ],
                    //   required: [true, 'Availability is required for tutors'],
                    //   validate: {
                    //     validator: (arr) => arr.length > 0,
                    //     message: 'At least one availability slot is required',
                    //   },
                    default: [],
                },
                expectedFeePerHour: {
                    type: Number,
                    //   required: [true, 'Expected fee per hour is required for tutors'],
                    //   min: [0, 'Fee cannot be negative'],
                    //   max: [1000, 'Fee cannot exceed 1000'],
                    default: 0,
                },
            },
            // required: function () {
            //     return this.userType === 'tutor';
            // },
        },
    },
    {
        timestamps: true,
    }
);

// JWT Methods
usersSchema.methods.getJWTToken = function () {
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    return jwt.sign({ userId: this._id, userType: this.userType }, process.env.JWT_SECRET || 'secret', {
        expiresIn: jwtExpiresIn,
    });
};

usersSchema.methods.getJWTTokenExpireDate = async function (jwtToken) {
    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || 'secret');
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

module.exports = mongoose.model('users', usersSchema);
