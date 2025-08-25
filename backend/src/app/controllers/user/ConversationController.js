const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
class ConversationController {

    // [GET] /api/conversations
    async getAllConversations(req, res) {
        try {
            const userId = req.user.id
            const conversations = await Conversation.find({'members.userId': userId})
            .populate('members.userId')
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

            const conversations = await Conversation.find({'members.userId': userId})
            .populate('members.userId', 'fullName avatar')
            .populate('lastMessage')

            const filteredConversations = conversations.filter(conversation => {
                if(conversation.isGroup) {
                    return regex.test(conversation.groupName)

                } else {
                    const otherMember = conversation.members.find(member => member.userId._id.toString() !== userId.toString())

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
                        userId: userId,
                        role: 'owner'
                    },
                    ...members.map(members_id => ({
                        userId: members_id,
                        role: 'member'
                    }))
                ],
            })

            const populatedConversation = await Conversation.findById(conversation._id)
                .populate('members.userId', 'fullName avatar')

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

    // [DELETE] /api/conversations/:conversationId/leave
    async leaveConversation(req, res) {
        try {
            const conversation = req.conversation
            const userId = req.user.id
            const isMember = conversation.members.find(member => member.userId.toString() === userId)

            if (!isMember) {
                return res.status(403).json({ message: 'You are not a member of this conversation.' })
            }

            if(isMember && conversation.members.length === 1) {
                return res.status(403).json({ message: 'You are the last member and cannot leave the conversation.', action: 'confirm_delete_conversation' })
            } else if (isMember && conversation.members.length > 1) {
                let newOwner = conversation.members
                    .filter(member => member.userId.toString() !== userId && member.role === 'admin')
                    .sort((a,b) => a.joinedAt - b.joinedAt)[0]
                
                if(!newOwner){
                    newOwner = conversation.members
                        .filter(member => member.userId.toString() !== userId && member.role === 'member')
                        .sort((a,b) => a.joinedAt - b.joinedAt)[0]
                }
                if (newOwner) {
                    newOwner.role = 'owner'
                }
            }

            conversation.members = conversation.members.filter(member => member.userId.toString() !== userId)
            await conversation.save()
            res.status(200).json({ message: 'Left conversation successfully.' })
        } catch (error) {
            console.error('Error leaving conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [DELETE] /api/conversations/:conversationId/groups
    async deleteConversation(req, res) {
        try {
            const conversation = req.conversation
            const userId = req.user.id

            const isOwner = conversation.members.some(member => member.userId.toString() === userId && member.role === 'owner')
            if (!isOwner) {
                return res.status(403).json({ message: 'Only the group owner can delete the conversation.' })
            }

            await Message.deleteMany({ conversationId: conversation._id })
            await conversation.deleteOne()
            res.status(200).json({ message: 'Conversation deleted successfully.' })
        } catch (error) {
            console.error('Error deleting conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/member/:memberId/role
    async updateMemberRole(req, res) {
        try {
            const conversation = req.conversation
            const memberId = req.params.memberId
            const newRole = req.body.role

            if (!newRole) {
                return res.status(400).json({ message: 'New role is required.' })
            }

            if(newRole === 'owner'){
                return res.status(403).json({ message: 'Cannot assign owner role.' })
            }

            const member = conversation.members.find(member => member.userId.toString() === memberId)
            if (!member) {
                return res.status(404).json({ message: 'Member not found.' })
            }

            member.role = newRole
            await conversation.save()

            res.status(200).json({ message: 'Member role updated successfully.' })
        } catch (error) {
            console.error('Error updating member role:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [PATCH] /api/conversations/:conversationId/member
    async addMemberToConversation(req, res) {
        try {
            const conversation = req.conversation
            const userIds = req.body.userIds

            if (!userIds || !Array.isArray(userIds)) {
                return res.status(400).json({ message: 'User IDs are required.' })
            }

            userIds.forEach(userId => {
                const isMember = conversation.members.find(member => member.userId.toString() === userId)
                if(isMember){
                    return res.status(400).json({ message: 'User is already a member of the conversation.' })
                }
                conversation.members.push({ userId, role: 'member' })
            })
            await conversation.save()

            await conversation.populate('members.userId', 'fullName avatar')
            const newUsers = conversation.members.filter(member => userIds.includes(member.userId._id.toString()))

            res.status(200).json({ 
                message: 'User added to conversation successfully.',
                newUsers
            })
        } catch (error) {
            console.error('Error adding user to conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [DELETE] /api/conversations/:conversationId/member/:memberId
    async deleteUserFromConversation(req, res) {
        try {
            const conversation = req.conversation
            const memberId = req.params.memberId

            const member = conversation.members.find(member => member.userId.toString() === memberId)
            if (!member) {
                return res.status(404).json({ message: 'Member not found.' })
            }

            conversation.members = conversation.members.filter(member => member.userId.toString() !== memberId)
            await conversation.save()

            res.status(200).json({ message: 'Member removed from conversation successfully.' })
        } catch (error) {
            console.error('Error deleting user from conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new ConversationController()