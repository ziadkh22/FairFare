const { requestRide, getRide, getRideById, acceptride, startride, endride, cancelride } = require('../controllers/ridecontroller');
const authmiddleware = require('../middlewares/auth');
const express = require('express')
const router = express.Router()
const { body } = require('express-validator')


const ridevalidator = [
    body('pickuplocation').trim().notEmpty().withMessage('pickup location is required please enter it'),
    body('dropofflocation').trim().notEmpty().withMessage('dropoff location is required please enter it'),
    body('distance').notEmpty().withMessage('distance is required')
]


router.use(authmiddleware)

router.post("/requestride", ridevalidator, requestRide)
router.get("/getride", getRide)
router.get("/getridebyid/:id", getRideById)
router.put("/accpetride/:id", acceptride)
router.put("/startride/:id", startride)
router.put("/endride/:id", endride)
router.put("/cancelride/:id", cancelride)

module.exports = router
