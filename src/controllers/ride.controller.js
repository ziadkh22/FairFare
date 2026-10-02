const User = require('../models/user.model')
const Driver = require('../models/driver.model')
const Ride = require('../models/ride.model')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()


//request rides 
const requestRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const { pickuplocation, dropofflocation, distance } = req.body

        //validations run automatically

        const ride = new Ride({
            passengerid: req.userid,
            pickuplocation: pickuplocation.trim(),
            dropofflocation: dropofflocation.trim(),
            distance: distance,
            status: 'requested',
            fare: distance * 10
        })
        await ride.save()
        res.status(201).json({
            success: true,
            message: "Your ride request is waiting for a driver to accept it",
            Ride_Details: ride
        })
    }
    catch (error) {
        next(error)
    }

}


//Get ride details by its driver or passenger only
const getRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.find({
            $or: [                             // finds rides where the current user is either the passenger or the driver
                { passengerid: req.userid },
                { driverid: req.userid }
            ]
        })
            .sort({ createdat: -1 })
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        res.status(201).json({
            success: true,
            Ride_Details: rides
        })
    }
    catch (error) {
        next(error)
    }
}

//Get specific ride details by its driver or passenger only
const getRideById = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        const isRidePassenger = rides.passengerid?._id?.toString() === req.userid
        const isRidedriver = rides.driverid?._id?.toString() === req.userid

        if (!isRidePassenger && !isRidedriver) {
            return res.status(401).json({ message: "You are not authorized to check this ride details" })
        }

        res.status(201).json({
            success: true,
            Ride_Details: rides
        })
    }
    catch (error) {
        next(error)
    }
}


//Driver Accept the ride
const acceptRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        if (rides.driverid) {
            return res.status(409).json({ message: "ride Already accepted by other driver" })
        }

        if (rides.status !== "requested") {
            return res.status(409).json({ message: "ride already started" })
        }

        const driver = await Driver.findOne({
            userid: req.userid
        })
        if (!driver) {
            return res.status(403).json({ message: "You are not authorized to accept this ride" })
        }


        if (!driver.isAvailable) {
            return res.status(409).json({ message: "You can not accept this ride bec you are not available" })
        }

        driver.isAvailable = false
        await driver.save()

        rides.status = 'accepted'
        rides.driverid = req.userid
        await rides.save()

        const updatedride = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            message: "ride is accepted successfully",
            Ride_Details: updatedride
        })
    }
    catch (error) {
        next(error)
    }
}

//Driver start the ride
const startRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        if (rides.status !== "accepted") {
            return res.status(409).json({ message: "ride already started or not accepted yet" })
        }

        const driver = await Driver.findOne({
            userid: req.userid
        })
        if (!driver) {
            return res.status(403).json({ message: "You are not authorized to start this ride" })
        }

        if (driver.isAvailable) {
            return res.status(409).json({ message: "You can not start this ride bec you are still available to accept rides" })
        }

        const isAuthDriver = rides.driverid?._id?.toString() === req.userid?.toString()
        if (!isAuthDriver) {
            return res.status(403).json({ message: "You are not authorized to start this ride" })
        }

        rides.status = 'started'
        rides.startedat = new Date()
        await rides.save()

        const updatedride = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            message: "ride is started successfully",
            Ride_Details: updatedride
        })
    }
    catch (error) {
        next(error)
    }
}

//Driver end the ride
const endRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        if (rides.status !== "started") {
            return res.status(409).json({ message: "ride can not be ended" })
        }

        const driver = await Driver.findOne({
            userid: req.userid
        })

        if (!driver) {
            return res.status(403).json({ message: "You are not authorized to end this ride" })
        }

        if (driver.isAvailable) {
            return res.status(409).json({ message: "You can not end this ride bec you are still available to accept rides" })
        }

        const isAuthDriver = rides.driverid?._id?.toString() === req.userid?.toString()
        if (!isAuthDriver) {
            return res.status(403).json({ message: "You are not authorized to end this ride" })
        }

        rides.status = 'completed'
        rides.completedat = new Date()
        await rides.save()

        driver.isAvailable = true
        await driver.save()


        const updatedride = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            message: `ride is ended successfully, please pay driver ${rides.fare}$`,
            Ride_Details: updatedride
        })
    }
    catch (error) {
        next(error)
    }
}

//Driver or passenger cancel the ride
const cancelRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {

        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(404).json({ message: "ride not found" })
        }

        if (['started', 'completed', 'canceled'].includes(rides.status)) {
            return res.status(409).json({ message: "ride can not be canceled" })
        }

        const isRidePassenger = rides.passengerid?._id?.toString() === req.userid.toString()
        const isRidedriver = rides.driverid?._id?.toString() === req.userid.toString()

        if (!isRidePassenger && !isRidedriver) {
            return res.status(401).json({ message: "You are not authorized to cancel this ride.." })
        }

        rides.status = 'canceled'
        await rides.save()

        const driver = rides.driverid
            ? await Driver.findOne({ userid: rides.driverid })
            : null
        if (driver) {
            driver.isAvailable = true
            await driver.save()
        }


        const updatedride = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            message: "ride is canceled successfully",
            Ride_Details: updatedride
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports = { requestRide, getRide, getRideById, acceptRide, startRide, endRide, cancelRide }