const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {


    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false })
    }

    const token = authHeader.split(' ')[1]

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userid = decoded.userid
        next()

    }

    catch (error) {
        next(error)
    }
}

module.exports = authMiddleware