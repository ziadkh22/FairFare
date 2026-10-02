const mongoose = require('mongoose')
require('dotenv').config()

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

const databaseConnection = () => mongoose.connect(process.env.MONGO_URI, {
    dbName: 'FairFare_test'
})
    .then(async () => {
        await removeLegacyRideIndexes()
        console.log("successful database connection")
    })
    .catch(err => {
        console.error("Failed to initialize the database:", err)
        process.exitCode = 1
    })

module.exports = databaseConnection