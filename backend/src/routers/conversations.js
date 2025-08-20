const express = require('express')
const router = express.Router()
const conversationController = require('../app/controllers/user/ConversationController')
const { upload, handleMulterError} = require('../app/middlewares/multer')
const uploadCloudinary = require('../app/middlewares/uploadCloudinary')
const checkIsGroup = require('../app/middlewares/checkIsGroup')

router.get('/search', conversationController.searchConversations)
router.post('/group', conversationController.createGroupConversation)
router.patch('/:conversationId/pin', conversationController.pinMessage)
router.patch('/:conversationId/unpin', conversationController.unpinMessage)
router.get('/:conversationId/pinned', conversationController.getPinnedMessages)
router.patch('/:conversationId/read', conversationController.markMessagesAsRead)
router.get('/:conversationId/media', conversationController.getConversationMedia)
router.get('/:conversationId/files', conversationController.getConversationFiles)
router.patch('/:conversationId/name', checkIsGroup, conversationController.updateConversationName)
router.patch('/:conversationId/avatar', 
    checkIsGroup, 
    upload.single('avatarGroup'), 
    handleMulterError, 
    uploadCloudinary, 
    conversationController.updateConversationAvatar
)
router.patch('/:conversationId/leave', checkIsGroup, conversationController.leaveConversation)
router.delete('/:conversationId/groups', checkIsGroup, conversationController.deleteConversation)
// router.delete('/:conversationId/users/:userId', conversationController.deleteUserFromConversation)
router.get('/', conversationController.getAllConversations)

module.exports = router