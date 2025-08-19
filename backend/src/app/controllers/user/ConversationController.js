const User = require('../../models/Account')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
class ConversationController {

    // [GET] /api/conversations
    async getAllConversations(req, res) {
        try {
            const userId = req.user.id
            const conversations = await Conversation.find({'members.user': userId})
            .populate('members.user')
            .populate({
                path: 'lastMessage',
                options: { withDeleted: true }
            })
            .sort({ lastMessageTime: -1 }) 

            if (!conversations || conversations.length === 0) {
                return res.status(404).json({ message: 'No conversations found.' })
            }   

            res.status(200).json(conversations)
        } catch (error) {
            console.error('Error fetching all conversations:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/conversations/search
    async searchConversations(req, res) {
        try {
            const search = req.query.q || ''
            const regex = new RegExp(search, 'i') 
            const userId = req.user.id

            const conversations = await Conversation.find({'members.user': userId})
            .populate('members.user', 'fullName avatar')
            .populate('lastMessage')

            const filteredConversations = conversations.filter(conversation => {
                if(conversation.isGroup) {
                    return regex.test(conversation.groupName)

                } else {
                    const otherMember = conversation.members.find(member => member._id.toString() !== userId.toString())

                    if(otherMember) {
                        return regex.test(otherMember.fullName)
                    }  
                    return false
                }
            })

            res.status(200).json(filteredConversations)
        } catch (error) {
            
        }
    }

    // [POST] /api/conversations/group
    async createGroupConversation(req, res) {
        try {
            const { groupName, members, groupAvatar } = req.body
            const userId = req.user.id

            if (!groupName || !members || members.length === 0) {
                return res.status(400).json({ message: 'Name and members are required.' })
            }

            const conversation = await Conversation.create({
                isGroup: true,
                groupName,
                groupAvatar,
                createdBy: userId,
                members: [
                    {
                        user: userId,
                        role: 'owner'
                    },
                    ...members.map(members_id => ({
                        user: members_id,
                        role: 'member'
                    }))
                ],
            })

            const populatedConversation = await Conversation.findById(conversation._id)
                .populate('members.user', 'fullName avatar')

            res.status(201).json(populatedConversation)

        } catch (error) {
            console.error('Error creating conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/pin
    async pinMessage(req, res) {
        try {
            const { conversationId } = req.params
            const { messageId } = req.body

            if (!messageId) {
                return res.status(400).json({ message: 'Message ID is required.' })
            }

            const message = await Message.findById(messageId)
            if( !message || !message.conversationId.equals(conversationId)) {
                return res.status(404).json({ message: 'Message not found in this conversation.' })
            }
            
            if(message.deleted) {
                return res.status(400).json({ message: 'Cannot pin a deleted message.' })
            }

            const conversation = await Conversation.findById(conversationId)
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            if(conversation.pinnedMessageIds.length >= 3) {
                return res.status(400).json({ message: 'You can only pin up to 3 messages.' })
            }

            if (conversation.pinnedMessageIds.includes(messageId)) {
                return res.status(400).json({ message: 'Message is already pinned.' })
            }

            conversation.pinnedMessageIds.push(messageId)
            await conversation.save()

            // Optional: Populate pinned messages
            const pinnedMessage = await Message.findById(messageId)
                .populate('senderId', 'fullName avatar')

            res.status(200).json({ 
                message: 'Message pinned successfully.', 
                pinnedMessage
            })

        } catch (error) {
            console.error('Error pinning message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/unpin
    async unpinMessage(req, res) {
        try {
            const { conversationId } = req.params
            const { messageId } = req.body

            if (!messageId) {
                return res.status(400).json({ message: 'Message ID is required.' })
            }

            const conversation = await Conversation.findById(conversationId)
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            conversation.pinnedMessageIds = conversation.pinnedMessageIds.filter(id => id.toString() !== messageId.toString())
            await conversation.save()

            res.status(200).json({ message: 'Message unpinned successfully.', conversation })
        } catch (error) {
            console.error('Error pinning message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/conversations/:conversationId/pinned
    async getPinnedMessages(req, res) {
        try {
            const { conversationId } = req.params
            const conversation = await Conversation.findById(conversationId)
            .populate({
                path: 'pinnedMessageIds',
                populate: {
                    path: 'senderId',
                    select: 'fullName avatar'
                }
            })

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            if (conversation.pinnedMessageIds.length === 0) {
                return res.status(404).json({ message: 'No pinned messages found.' })
            }

            res.status(200).json(conversation.pinnedMessageIds)
        } catch (error) {
            console.error('Error fetching pinned messages:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/read
    async markMessagesAsRead(req, res) {
        try {
            const { conversationId } = req.params
            const userId = req.user.id
            const conversation = await Conversation.findById(conversationId)

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            if (!conversation.unreadCount.has(userId)) {
                return res.status(400).json({ message: 'No unread messages for this user.' })
            }

            conversation.unreadCount.set(userId, 0)
            await conversation.save()

            await Message.updateMany(
                { conversationId, 'seenBy.userId': { $ne: userId }, senderId: { $ne: userId } },
                { $push: { seenBy: { userId, seenAt: new Date() } } , $set: { status: 'seen' } }
            )

            res.status(200).json({ message: 'Messages marked as seen successfully.' })
        }
        catch (error) {
            console.error('Error marking messages as seen:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/conversations/:conversationId/media
    async getConversationMedia(req, res) {
        try {
            const { conversationId } = req.params
            const messageMedia = await Message.find({ 
                conversationId, 
                messageType: 'media', 
                attachments:{
                    $elemMatch: {
                        type: { $in: ['image', 'video'] }
                    }
                }
            }).sort({ createdAt: -1 })

            if (!messageMedia || messageMedia.length === 0) {
                return res.status(404).json({ message: 'No images/videos found for this conversation.' })
            }

            res.status(200).json(messageMedia)
        } catch (error) {
            console.error('Error fetching conversation media:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/conversations/:conversationId/files
    async getConversationFiles(req, res) {
        try {
            const { conversationId } = req.params
            const messageFiles = await Message.find({ 
                conversationId, 
                messageType: 'media', 
                attachments:{
                    $elemMatch: {
                        type: { $in: ['file'] }
                    }
                }
            }).sort({ createdAt: -1 })

            if (!messageFiles || messageFiles.length === 0) {
                return res.status(404).json({ message: 'No files found for this conversation.' })
            }

            res.status(200).json(messageFiles)
        } catch (error) {
            console.error('Error fetching conversation files:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/name
    async updateConversationName(req, res) {
        try {
            const conversation = req.conversation
            conversation.groupName = req.body.groupName.trim()
            await conversation.save()

            res.status(200).json({ message: 'Group name updated successfully!' })
        } catch (error) {
            console.error('Error updating group name:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/avatar
    async updateConversationAvatar(req, res) {
        try {
            const conversation = req.conversation
            if(!req.uploadResults || !req.uploadResults.secure_url) {
                return res.status(400).json({ message: 'Avatar image is required.' })
            }

            conversation.groupAvatar = req.uploadResults.secure_url
            await conversation.save()

            res.status(200).json({ 
                message: 'Group avatar updated successfully!',
                groupAvatar: conversation.groupAvatar
            })
        } catch (error) {
            console.error('Error updating group avatar:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

}

module.exports = new ConversationController()