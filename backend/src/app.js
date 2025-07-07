require('dotenv').config()
const express = require('express')
const app = express()
const db = require('./config/db')
const router = require('./routers/index')
const cookieParser = require('cookie-parser')
const cors = require('cors')

// Connect to DB
db.connect()

// Middleware CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true, 
}))

// Middleware cookie-parser
app.use(cookieParser())

// Middleware body-parser JSON
app.use(express.json())

// Router
router(app)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
})