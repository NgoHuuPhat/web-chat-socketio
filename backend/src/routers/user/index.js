const express = require('express')
const router = express.Router()
const homeRouter = require('./home')
const authMiddleware = require('../../app/middlewares/authMiddleware')

router.use('/home', authMiddleware, homeRouter)

module.exports = router