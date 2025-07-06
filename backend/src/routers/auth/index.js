const express = require('express')
const router = express.Router()
const authController = require('../../app/controllers/auth/AuthController')

router.post('/register', authController.registerPost)
router.post('/login', authController.loginPost)
router.get('/logout', authController.logout)
router.get('/refresh-token', authController.refreshToken)

module.exports = router