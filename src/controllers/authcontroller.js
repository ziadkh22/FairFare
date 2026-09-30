const mongoose = require('mongoose')
const User = require('../models/users')
const Driver = require('../models/driver');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")
require("dotenv").config()
const { validationResult } = require('express-validator')



const register = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() })
    }


    try {
        //input
        const { name, email, password, role } = req.body;

        //validation
        if (!name || !typeof name === 'String' || !name.trim()) {
            return res.status(400).json({ message: "Wrong or missed name" })
        }
        if (!email || !typeof email === 'String' || !email.trim()) {
            return res.status(400).json({ message: "Wrong or missed email" })
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ message: "Wrong password" })
        }


        //checking if the user already registered
        const isregistered = await User.findOne({
            email: email.trim().toLowerCase()
        })

        if (isregistered) {
            return res.status(500).json({ message: "This Email already registered" })
        }

        // Hashing the password
        const hashedpassword = await bcrypt.hash(password, 10)

        //saving data to database
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedpassword,
            role: role === 'driver' ? 'driver' : 'user'
        })
        await user.save()

        // if the register user is driver so we saved his data into driver table
        if (user.role === 'driver') {
            const driver = new Driver({
                userid: user._id
            })
            await driver.save()
        }

        // removing password from the response
        const userresponse = user.toObject()
        delete userresponse.password;

        // the  response at success Registration
        res.status(200).json({
            success: true,
            message: "User Registration done",
            userresponse
        })
    }
    catch (error) {
        next(error)

    }

}


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "missed email or password" })
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        })

        if (!user) {
            return res.status(400).json({ message: "invalid email or password" })
        }

        const ispasswordvalid = await bcrypt.compare(password, user.password)
        if (!ispasswordvalid) {
            return res.status(500).json({ message: "Wrong email or password" })
        }

        const token = jwt.sign(
            { userid: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        // the  response at success Registration
        res.status(200).json({
            success: true,
            token: token,
            user
        })
    }
    catch (error) {
        next(error)
    }
}



module.exports = { register, login };