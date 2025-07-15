const User = require('../../models/Account')
const Conversation = require('../../models/Conversation')

class ConversationController {

    // [GET] /api/conversations
    async getAllConversations(req, res) {
        try {
            const userId = req.user.id
            const conversations = await Conversation.find({
                members: { $in: [userId] }
            })
            .populate('members', 'fullName avatar')
            .populate('lastMessage')
            .sort({ lastMessageTime: -1 }) 

            if (!conversations || conversations.length === 0) {
                return res.status(404).json({ message: 'No conversations found.' });
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

            const conversations = await Conversation.find({
                members: { $in: [userId] },
            })
            .populate('members', 'fullName avatar')
            .populate('lastMessage')

            const filteredConversations = conversations.filter(conversation => {
                if(conversation.isGroup) {
                    return regex.test(conversation.name)

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
                members: [userId, ...members],
            })
            
            res.status(201).json(conversation)

        } catch (error) {
            console.error('Error creating conversation:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new ConversationController();