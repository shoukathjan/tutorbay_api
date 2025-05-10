const mongoose = require('mongoose');

const postRequirementSchema = new mongoose.Schema(
    {
        postRequirementSchema: {
            type: mongoose.Schema.Types.ObjectId,
            default: function () {
                return this._id
            },
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            index: true,
            required: true,
        },
        userType: {
            type: String,
            enum: ['student', 'parent'],
            index: true,
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        curriculum: {
            type: String,
            required: true,
            trim: true,
        },
        grade: {
            type: String,
            required: false,
            trim: true,
        },
        emirates: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            currentLocationURL: {
                type: String,
                default: '',
            },
            mapLocation: {
                type: [{ lat: Number, lng: Number }],
                default: [],
            },
        },
        modeOfTeaching: {
            type: String,
            enum: ['online', 'offline', 'both'],
            required: true,
        },
        availability: {
            type: [
                {
                    days: {
                        type: String,
                        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        // required: true
                    },
                    startTime: { type: String },
                    endTime: { type: String }
                }
            ],
            // required: true
        },
        expectedFee: {
            type: Number,
            required: false,
            default: 0,
        },
        additionalNotes: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['open', 'active', 'close'],
            default: 'open',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('postrequirements', postRequirementSchema);
