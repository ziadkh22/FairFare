const jwt = require('jsonwebtoken')
require("dotenv").config()

function authmiddleware(req, res, next) {
    const authheader = req.headers.authorization

    if (!authheader || !authheader.startsWith('Bearer ')) {
        return res.status(404).json({ success: false })
    }

    const token = authheader.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userid = decoded.userid
        next()

    }

    catch (error) {
        next(error)
    }
}

module.exports = authmiddleware

