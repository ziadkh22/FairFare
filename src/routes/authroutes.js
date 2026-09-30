// const mongoose = require('mongoose')
// const User = require('../models/users')
const { register, login } = require('../controllers/authcontroller');
const { body } = require('express-validator')
const express = require('express')
const router = express.Router()


// validation

const authvalidator = [
    body('name').trim().notEmpty().withMessage('Name is required please enter it'),
    body('email').trim().notEmpty().withMessage('email is required please enter it'),
    body('password').isLength({ min: 8 }).notEmpty().withMessage('password is required and must be > 8')
]



// router.use(authmiddleware)
router.post("/register", authvalidator, register);
router.post("/login", login);

module.exports = router