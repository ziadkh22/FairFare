const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true

    },
    role: {
        type: String,
        enum: ['user', 'driver'],
        default: 'user',
        trim: true,
        required: true
    }
}, { timestamps: true })


const user = mongoose.model('user', userschema)

module.exports = user;