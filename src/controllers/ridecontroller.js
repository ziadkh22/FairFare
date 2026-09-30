const User = require('../models/users')
const Driver = require('../models/driver');
const Ride = require('../models/ride');
const ride = require('../models/ride');
const { validationResult } = require('express-validator')


// request the ride---------------
const requestRide = async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() })
    }

    try {

        const { pickuplocation, dropofflocation, distance } = req.body

        if (!pickuplocation || !typeof pickuplocation === 'String' || !pickuplocation.trim()) {
            return res.status(400).json({ message: "Missed Pickup location" })
        }

        if (!dropofflocation || !typeof dropofflocation === 'String' || !dropofflocation.trim()) {
            return res.status(400).json({ message: "Missed dropoff location" })
        }

        if (!distance || !typeof dropofflocation === 'Number' || distance < 1) {
            return res.status(400).json({ message: "Missed or wrong location" })
        }
        const ride = new Ride({
            passengerid: req.userid, // from the token of the logged in passenger
            pickuplocation: pickuplocation.trim(),
            dropofflocation: dropofflocation.trim(),
            status: 'requested',
            distance: distance
        })
        await ride.save()

        res.status(201).json({
            success: true,
            ride
        })

    }
    catch (error) {
        next(error)
    }
}

// get details about the ride---------------
const getRide = async (req, res, next) => {

    try {

        const rides = await Ride.find({

            $or: [
                { passengerid: req.userid },
                { driverid: req.userid }
            ]
        })
            .sort({ createdat: -1 })
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }



        res.status(201).json({
            success: true,
            rides
        })

    }
    catch (error) {
        next(error)
    }
}

const getRideById = async (req, res, next) => {

    try {

        const rides = await Ride.findById(req.params.id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }

        const isPassenger = rides.passengerid?._id?.toString() === req.userid
        const isdriver = rides.driverid?._id?.toString() === req.userid

        if (!isPassenger && !isdriver) {
            return res.status(400).json({ message: "You are not authorized to check this ride details" })
        }

        res.status(201).json({
            success: true,
            rides
        })

    }
    catch (error) {
        next(error)
    }
}

// accept the ride---------------
const acceptride = async (req, res, next) => {

    try {

        // check driver
        const driver = await Driver.findOne({
            userid: req.userid
        })

        if (!driver) {
            return res.status(400).json({ message: "You are not driver to accept the ride" })
        }
        if (!driver.isAvailable) {
            return res.status(400).json({ message: "You are not availabe to accept the ride" })
        }

        // check ride
        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }

        if (!rides.status === "requested") {
            return res.status(400).json({ message: "ride is not available for acceptance" })
        }

        if (rides.driverid) {
            return res.status(400).json({ message: "ride is already accepted" })
        }

        rides.driverid = req.userid
        rides.status = "accepted"
        await rides.save()

        driver.isAvailable = "false"
        await driver.save()


        const newacceptedride = await Ride.findById(rides._id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            newacceptedride
        })

    }
    catch (error) {
        next(error)
    }
}

// start the ride---------------
const startride = async (req, res, next) => {

    try {


        // check ride
        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }

        if (!rides.status === "accepted") {
            return res.status(400).json({ message: "ride is not available to start" })
        }


        // check driver

        if (rides.driverid?._id?.toString() !== req.userid.toString()) {
            return res.status(400).json({ message: "You are not authorized to start the ride" })
        }

        rides.status = "started"
        rides.startedat = new Date()
        await rides.save()

        const newstartedride = await Ride.findById(rides._id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            newstartedride
        })

    }
    catch (error) {
        next(error)
    }
}


// Completing the ride---------------
const endride = async (req, res, next) => {

    try {


        // check ride
        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }

        if (!rides.status === "started") {
            return res.status(400).json({ message: "ride is not available to be completed bec its not started yet" })
        }


        // check driver

        if (rides.driverid?._id?.toString() !== req.userid.toString()) {
            return res.status(400).json({ message: "You are not authorized to end the ride" })
        }


        const fare = rides.distance * 10

        if (!typeof fare === "Number" || fare === null || fare < 1) {
            return res.status(400).json({ message: "Error in the fare of the ride" })
        }

        rides.status = "completed"
        rides.completedat = new Date()
        rides.fare = fare
        await rides.save()


        const driver = await Driver.findOne({
            userid: req.userid
        })
        if (driver) {
            driver.isAvailable = true
            await driver.save()
        }

        const newendedride = await Ride.findById(rides._id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            newendedride
        })

    }
    catch (error) {
        next(error)
    }
}


// cancel the ride---------------
const cancelride = async (req, res, next) => {

    try {

        // check ride
        const rides = await Ride.findById(req.params.id)

        if (!rides) {
            return res.status(400).json({ message: "ride not found" })
        }

        if (rides.status === "started" || rides.status === "completed" || rides.status === "canceled") {
            return res.status(400).json({ message: "ride is not available to be canceled" })
        }


        // check passenger and driver

        const ispassenger = rides.passengerid?._id?.toString() === req.userid.toString()
        const isdriver = rides.driverid?._id?.toString() === req.userid.toString()
        if (!ispassenger && !isdriver) {
            return res.status(400).json({ message: "You are not authorized to end the ride" })
        }


        rides.status = "canceled"
        rides.startedat = null
        rides.fare = null
        await rides.save()


        const driver = await Driver.findOne({
            userid: req.userid
        })
        if (driver) {
            driver.isAvailable = true
            await driver.save()
        }

        const newcanceledride = await Ride.findById(rides._id)
            .populate("passengerid", "name email")
            .populate("driverid", "name email")

        res.status(201).json({
            success: true,
            newcanceledride
        })

    }
    catch (error) {
        next(error)
    }
}


module.exports = { requestRide, getRide, getRideById, acceptride, startride, endride, cancelride };