const express = require('express')
const router = express.Router()
const conversationController = require('../app/controllers/user/ConversationController')
const { upload, handleMulterError} = require('../app/middlewares/multer')
const uploadCloudinary = require('../app/middlewares/uploadCloudinary')
const checkIsGroup = require('../app/middlewares/checkIsGroup')
const groupRoleMiddleware = require('../app/middlewares/groupRoleMiddleware')

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
router.delete('/:conversationId/leave', checkIsGroup, conversationController.leaveConversation)
router.delete('/:conversationId/groups', checkIsGroup, groupRoleMiddleware(['owner']), conversationController.deleteConversation)
router.patch('/:conversationId/member/:memberId/role', checkIsGroup, groupRoleMiddleware(['owner']), conversationController.updateMemberRole)
router.patch('/:conversationId/member',  checkIsGroup, groupRoleMiddleware(['owner', 'admin']), conversationController.addMemberToConversation)
router.delete('/:conversationId/member/:memberId', checkIsGroup, groupRoleMiddleware(['owner', 'admin']), conversationController.deleteUserFromConversation)
router.get('/', conversationController.getAllConversations)

module.exports = router