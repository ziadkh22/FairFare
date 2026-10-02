const { body } = require('express-validator')

const allowedRoles = ['user', 'driver']
const RegisterValidator = [
    body('name').notEmpty().trim().withMessage("Name is Required OR must be Valid"),
    body('email').isEmail().notEmpty().trim().withMessage("Email is Required OR must be Valid"),
    body('password').notEmpty().isLength({ min: 8 }).withMessage("Password is Required OR must be more than 8 characters"),
    body('role').notEmpty().trim().isIn(allowedRoles).withMessage("Role is Required OR must be Valid")
]

const LoginValidator = [

    body('email').isEmail().notEmpty().trim().withMessage("Email is Required OR must be Valid"),
    body('password').notEmpty().isLength({ min: 8 }).withMessage("Password is Required OR must be more than 8 characters"),

]

const RideValidator = [
    body('pickuplocation').notEmpty().trim().withMessage("pickup location is Required OR must be Valid"),
    body('dropofflocation').notEmpty().trim().withMessage("dropoff location is Required OR must be Valid"),
    body('distance')
        .exists()
        .withMessage('Distance is required')
        .bail() // stops validation for that field if the previous check fails
        .isFloat({ gt: 0 }) // If decimals are allowed , gt : greater than
        .withMessage('Distance must be a positive integer')

]

module.exports = { RegisterValidator, LoginValidator, RideValidator }