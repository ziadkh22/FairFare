const mongoose = require('mongoose')
const User = require('./user.model')

const rideschema = new mongoose.Schema({
    passengerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    driverid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    distance: {
        type: Number,
        min: 0, // must be positive
        required: true
    },
    fare: {
        type: Number,
        default: 30,
        min: 30
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