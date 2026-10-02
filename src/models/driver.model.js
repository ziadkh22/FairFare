const mongoose = require('mongoose')
const User = require('./user.model')

const driverschema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        unique: true,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    carinfo: {
        type: String,
        trim: true,
        default: ''

    },
    license: {
        type: String,
        trim: true,
        default: ''
    }

}, { timestamps: true })

const driver = mongoose.model('driver', driverschema)

module.exports = driver;