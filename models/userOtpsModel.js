const mongoose = require('mongoose')

const userOtpsSchema = new mongoose.Schema({
    userotpId:{
        type: mongoose.Schema.Types.ObjectId,
        default: function(){
            return this._id
        }
    },
    // userId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref:'users',
    //     deafult:null
    // },
    email:{
        type: String,
        index:{unique:true},
        default: ""
    },
    otpCode:{
        type: Number,
        default: 0
    },
    otpExpiredTime:{
        type: Date,
        default: new Date()
    },
    otpVerifiedTime:{
        type: Date,
        default: new Date()
    },
    otpFailedCount:{
        type: Number,
        default: 0
    }
},{timestamps:true})

module.exports = mongoose.model('userotps',userOtpsSchema)