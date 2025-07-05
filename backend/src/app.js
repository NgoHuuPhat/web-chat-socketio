require('dotenv').config()
const express = require('express')
const app = express()
const db = require('./config/db')
const router = require('./routers/user/index')

// Connect to DB
db.connect()

// Router
router(app)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
})