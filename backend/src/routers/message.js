const express = require('express')
const router = express.Router()
const messageController = require('../app/controllers/user/MessageController')

// router.get('/', messageController.getMessages)
router.post('/', messageController.sendMessage)
// router.delete('/:id', messageController.deleteMessage)
// router.patch('/:id', messageController.updateMessage)

module.exports = router