//Importing Packages
const express = require('express')
const app = express()

require('dotenv').config()
const port = process.env.PORT

const mongoose = require('mongoose')
const databaseConnection = require('./database/mongodb')
const dns = require('dns')

const authroutes = require('./routes/auth.routes')
const rideroutes = require('./routes/ride.routes')


// MongoDB Connection
dns.setServers(['1.1.1.1', '8.8.8.8']);
databaseConnection()

//Routes Middlewares    
app.use(express.json())
app.use("/api/auth", authroutes)
app.use("/api/ride", rideroutes)


// Error Handling
app.use((err, req, res, next) => {
    console.error(err)
    const status = err.statuscode || err.status || 500
    const message = err.message || 'internal server error'
    res.status(status).json(message)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

app.get('/', async (req, res) => {
    res.send("Server is running....")
})