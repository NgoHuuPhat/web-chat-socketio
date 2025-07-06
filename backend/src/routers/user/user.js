var express = require('express')
var router = express.Router()
const UserController = require('../../app/controllers/user/UserController')

router.post('/register', UserController.registerPost)
router.post('/login', UserController.loginPost)
router.get('/logout', UserController.logout)
router.get('/refresh-token', UserController.refreshToken)

module.exports = router
