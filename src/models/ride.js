const mongoose = require('mongoose')
const User = require('./users')

const rideschema = new mongoose.Schema({
    passengerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    driverid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User

    },
    pickuplocation: {
        type: String,
        trim: true,
        required: true
    },
    dropofflocation: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'started', 'completed', 'canceled'],
        default: 'requested'
    },
    distance: {
        type: Number,
        default: null
    },
    fare: {
        type: Number,
        default: null
    },
    startedat: {
        type: Date,
        default: null
    },
    completedat: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const ride = mongoose.model('ride', rideschema)

module.exports = ride;