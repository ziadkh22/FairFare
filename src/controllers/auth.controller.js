const User = require('../models/user.model')
const Driver = require('../models/driver.model')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        //input
        const { name, email, password, role } = req.body;

        //validations run automatically

        // checking if already registered

        const isRegistered = await User.findOne({
            email: email.trim().toLowerCase()
        })
        if (isRegistered) {
            return res.status(409).json({ message: 'This Email is already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role.trim()
        })

        await user.save()
        if (user.role === 'driver') {
            const driver = new Driver({
                userid: user._id
            })

            await driver.save()
        }

        const userResponse = user.toObject();
        delete userResponse.password

        res.status(201).json({
            success: true,
            message: 'Registration done',
            userResponse
        })

    }
    catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        //Inputs
        const { email, password } = req.body;
        //validations run automatically

        // checking if already registered

        const users = await User.findOne({
            email: email.trim().toLowerCase()
        })
        if (!users) {
            return res.status(401).json({ message: 'invalid Email or Password' })
        }

        const isValidPassword = await bcrypt.compare(password, users.password)
        if (!isValidPassword) {
            return res.status(401).json({ message: 'invalid Email or Password' })
        }



        const token = jwt.sign(
            { userid: users._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )


        const userResponse = users.toObject();
        delete userResponse.password

        res.status(201).json({
            success: true,
            message: 'Login done',
            token: token,
            userResponse
        })

    }
    catch (error) {
        next(error)
    }
}

module.exports = { register, login }