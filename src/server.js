const express = require('express')
const app = express()
require("dotenv").config()
const port = process.env.PORT
const mongoose = require('mongoose')
const authroutes = require("./routes/authroutes")
const rideroutes = require("./routes/rideroutes")
const cors = require('cors')

// Database ------------------------------------------
// Solving Database Connection Failure
const dns = require('dns')
dns.setServers(["1.1.1.1", "8.8.8.8"]);



// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    dbName: 'FireFare' // database name 
})
    .then(() => console.log('Connected to FireFare MongoDB database.'))
    .catch(err => console.error(err));


//Middlewares-------------
app.use(cors())
app.use(express.json())
app.use("/api/auth", authroutes)
app.use("/api/ride", rideroutes)


// validation middleware
app.use((err, req, res, next) => {
    console.error(err)
    const status = err.statuscode || err.status || 500
    const message = err.message || "Internal server error"
    res.status(status).json({ message })
})

// Server Runing Testing------------------------ 
app.listen(port, async () => {

    console.log(`Service is running on http://localhost:${port}`)
})
app.get('/', async (req, res) => {
    res.send("Hello In Testing Environment")
})

