const express = require('express')
const router = express.Router()
const conversationController = require('../app/controllers/user/ConversationController')

router.get('/search', conversationController.searchConversations)
router.post('/group', conversationController.createGroupConversation)
router.patch('/:conversationId/pin', conversationController.pinMessage)
router.patch('/:conversationId/unpin', conversationController.unpinMessage)
router.get('/:conversationId/pinned', conversationController.getPinnedMessages)
router.patch('/:conversationId/read', conversationController.markMessagesAsRead)
router.get('/', conversationController.getAllConversations)
// router.delete('/:id', messageController.deleteMessage)
// router.patch('/:id', messageController.updateMessage)

module.exports = router