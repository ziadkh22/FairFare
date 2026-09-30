const mongoose = require('mongoose')
const User = require('./users')

const driverschema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        unique: true
    },
    carinfo: {
        type: String,
        trim: true,
        default: ''
    },
    licenseno: {
        type: String,
        trim: true,
        default: ''
    },
    isAvailable: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })

const driver = mongoose.model('driver', driverschema)

module.exports = driver;