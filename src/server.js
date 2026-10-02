//Importing Packages
const express = require('express')
const app = express()

require('dotenv').config()
const port = process.env.PORT

const mongoose = require('mongoose')

const authroutes = require('./routes/auth.routes')
const rideroutes = require('./routes/ride.routes')

const removeLegacyRideIndexes = async () => {
    const ridesCollectionExists = await mongoose.connection.db
        .listCollections({ name: 'rides' }, { nameOnly: true })
        .hasNext()

    if (!ridesCollectionExists) {
        return
    }

    const ridesCollection = mongoose.connection.collection('rides')
    const indexes = await ridesCollection.indexes()
    const legacyIndexes = indexes.filter(index =>
        index.unique &&
        Object.keys(index.key).length === 1 &&
        ['passengerid', 'driverid'].includes(Object.keys(index.key)[0])
    )

    for (const legacyIndex of legacyIndexes) {
        try {
            await ridesCollection.dropIndex(legacyIndex.name)
            console.log(`Removed legacy unique ride index: ${legacyIndex.name}`)
        } catch (error) {
            if (error.code !== 27) {
                throw error
            }
        }
    }
}

// MongoDB Connection
const dns = require('dns')
dns.setServers(['1.1.1.1', '8.8.8.8']);
mongoose.connect(process.env.MONGO_URI, {
    dbName: 'FairFare_test'
})
    .then(async () => {
        await removeLegacyRideIndexes()
        console.log("successful database connection")
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`)
        })
    })
    .catch(err => {
        console.error("Failed to initialize the database:", err)
        process.exitCode = 1
    })

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

app.get('/', async (req, res) => {
    res.send("Server is running....")
})