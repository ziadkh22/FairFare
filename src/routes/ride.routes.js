const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/jwt.middleware')
const { RideValidator } = require('../validators/validators')
const { requestRide, getRide, getRideById, acceptRide, startRide, endRide, cancelRide } = require('../controllers/ride.controller')

router.use(authMiddleware)

router.post("/requestRide", RideValidator, requestRide)
router.get("/getRides", getRide)
router.get("/getRideById/:id", getRideById)
router.put("/acceptRide/:id", acceptRide)
router.put("/startRide/:id", startRide)
router.put("/endRide/:id", endRide)
router.put("/cancelRide/:id", cancelRide)

module.exports = router