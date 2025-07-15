const express = require('express')
const router = express.Router()
const conversationController = require('../app/controllers/user/ConversationController')

router.get('/search', conversationController.searchConversations)
router.get('/', conversationController.getAllConversations)
router.post('/group', conversationController.createGroupConversation)
// router.delete('/:id', messageController.deleteMessage)
// router.patch('/:id', messageController.updateMessage)

module.exports = router