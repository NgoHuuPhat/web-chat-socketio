const express = require('express')
const router = express.Router()
const messageController = require('../app/controllers/user/MessageController')
const { upload, handleMulterError} = require('../app/middlewares/multer')
const uploadCloudinary = require('../app/middlewares/uploadCloudinary')

router.post('/', messageController.sendMessage)
router.get('/:conversationId', messageController.getMessages)
router.delete('/:id', messageController.deleteMessage)
router.post('/media',
    upload.fields([
        { name: 'image' },
        { name: 'video' },
        { name: 'file'  },
        { name: 'audio' },
    ]),
    handleMulterError,
    uploadCloudinary,
    messageController.sendMediaMessage
)
// router.patch('/:id', messageController.updateMessage)

module.exports = router