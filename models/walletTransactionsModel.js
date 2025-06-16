const mongoose = require('mongoose')

const walletTransactionsSchema = new mongoose.Schema({
    walletTransactionId:{
        type: mongoose.Schema.Types.ObjectId,
        default: function(){
            return this._id
        }
    },
    tranasactionId:{
        type:String,
        index:{unique:true},
        default:""
    },
    paymentId: {
        type: String,
        unique: true,
        index: true,
        sparse: true // allow multiple nulls/missing fields
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        index:true,
        default:null
    },
    requirementId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'postrequirements',
        index:true,
        default:null
    },
    transactionType:{
        type:String,
        default:""
    },
    walletCredits:{
        type:Number,
        default:0
    },
    userType:{
        type:String,
        default:""
    },
    paymentStatus:{
        type:String,
        default:""
    },

},{timestamps:true});

module.exports = mongoose.model('wallettransactions',walletTransactionsSchema)