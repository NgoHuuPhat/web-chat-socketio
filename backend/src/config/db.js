const mongoose = require('mongoose')
const { autoSeed } = require('../database/seeder')

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        await autoSeed()
        console.log('Connect successfully!!!')
    } catch (error) {
        console.error('Connect failure!!!', error.message)
    }
}

module.exports = { connect }