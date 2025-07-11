const express = require('express')
const router = express.Router()
const userController = require('../app/controllers/user/UserController')

router.get('/', userController.getUsers)
router.get('/search', userController.searchUsers)

module.exports = router