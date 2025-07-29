const express = require('express')
const router = express.Router()
const userController = require('../app/controllers/user/UserController')
const authMiddleware = require('../app/middlewares/authMiddleware')
const { upload, handleMulterError} = require('../app/middlewares/multer')
const uploadCloudinary = require('../app/middlewares/uploadCloudinary')

router.patch('/profile', authMiddleware, upload.single('avatar'), handleMulterError, uploadCloudinary, userController.updateProfile)
router.get('/search', authMiddleware, userController.searchUsers)
router.get('/', authMiddleware, userController.getUsers)

router.get('/:slug', userController.getProfileBySlug)

module.exports = router