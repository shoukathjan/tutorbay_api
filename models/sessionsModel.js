const mongoose = require('mongoose')


const sessionsSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        default:null
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        index : true,
        default:null
    },
    tutorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'tutors',
        index : true,
        default:null
    },
    accessToken:{
        type:String,
        default:""
    },
    expirationTime: {
        type: String,
        default:""
    },
    expirationReason:{
        type:String,
        default:""
    },
    status:{
        type:String,
        enum:['open','closed'],
        default:"open"
    },
    userType:{
        type:String,
        default:""
    }
    
},{timestamps:true});

sessionsSchema.pre('save', function(next) {
    this.sessionId = this._id;
    next();
});

module.exports = mongoose.model('sessions',sessionsSchema)