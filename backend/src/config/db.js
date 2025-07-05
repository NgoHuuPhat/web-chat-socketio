const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connect successfully!!!')
    } catch (error) {
        console.error('Connect failure!!!', error.message)
    }
}

module.exports = { connect }