const express = require('express')
const router = express.Router()
const authController = require('../../app/controllers/auth/AuthController')

router.post('/register', authController.registerPost)
router.post('/login', authController.loginPost)
router.get('/logout', authController.logout)
router.get('/refresh-token', authController.refreshToken)
router.post('/forgot-password', authController.forgotPasswordPost)
router.post('/verify-otp', authController.verifyOTPPost)
router.post('/reset-password', authController.resetPasswordrPost)


module.exports = router