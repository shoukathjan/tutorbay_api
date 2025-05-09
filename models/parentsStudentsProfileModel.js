const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentParentProfileSchema  = new mongoose.Schema({
    parentsOrStudentsId: {
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
    curriculum: {
        type: String, // EX:['British', 'American', 'IB', 'CBSE', 'Other'],
        default: '',
    },
    subject: {
        type: String,
        default: '',
    },
    emirates: {
        type: String,  //EX:['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
        default: '',
        index: true,
    },
    location: {
        currentLocationURL: {
            type: String,
            default: '',
        },
        mapLocation: {
            type: [{ lat: { type: Number, required: true }, lng: { type: Number, required: true } }],
            default: [],
        },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('studentparentprofile', studentParentProfileSchema);
