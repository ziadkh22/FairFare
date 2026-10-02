const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/auth.controller')
const { RegisterValidator, LoginValidator } = require('../validators/validators')


router.post("/register", RegisterValidator, register)
router.post("/login", LoginValidator, login)

module.exports = router