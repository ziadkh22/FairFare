const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'driver'],
        default: 'user',
        required: true
    }

}, { timestamps: true })

const user = mongoose.model('user', userschema)

module.exports = user;