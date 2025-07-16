const express = require('express')
const router = express.Router()
const messageController = require('../app/controllers/user/MessageController')

router.post('/', messageController.sendMessage)
router.get('/:conversationId', messageController.getMessages)
router.delete('/:id', messageController.deleteMessage)
// router.patch('/:id', messageController.updateMessage)

module.exports = router