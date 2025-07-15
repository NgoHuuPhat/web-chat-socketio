const User = require('../../models/Account')
const Message = require('../../models/Message')
const Conversation = require('../../models/Conversation')
const e = require('express')

class MessageController {
    // [POST] /api/messages
    async sendMessage(req, res) {
        try {
            const { content, receiverId, conversationId  } = req.body
            const senderId = req.user.id

            if(!content){
                return res.status(400).json({ message: 'Content is required.' })
            }

            let conversation

            // If group conversation
            if(conversationId){
                conversation = await Conversation.findById(conversationId)
                if(!conversation) {
                    return res.status(404).json({ message: 'Conversation not found.' })
                }
            
            // If 1-1 conversation
            } else {
                if(!receiverId) {
                    return res.status(400).json({ message: 'Receiver ID is required.' })
                }

                const Receiver = await User.findById(receiverId)
                if(!Receiver) {
                    return res.status(404).json({ message: 'Receiver not found.' })
                }

                conversation = await Conversation.findOne({
                    isGroup: false,
                    members: { $all: [senderId, receiverId], $size: 2 }
                })

                if(!conversation) {
                    conversation = await Conversation.create({
                        isGroup: false,
                        members: [senderId, receiverId],
                    })
                }
            }

            const message = await Message.create({
                conversationId: conversation._id,
                senderId,
                content,
            })

            // Update conversation with the latest message
            conversation.lastMessage = message._id
            conversation.lastMessageTime = message.createdAt
            await conversation.save()

            res.status(201).json({
                message: 'Message sent successfully.',
                data: {
                    _id: message._id,
                    senderId: message.senderId,
                    content: message.content,
                    createdAt: message.createdAt,
                    conversationId: conversation._id
                }
            })  
        } catch (error) {
            console.error('Error sending message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/messages/:conversationId
    async getMessages(req, res) {
        try {
            const { conversationId } = req.params
            if (!conversationId) {
                return res.status(400).json({ message: 'Conversation ID is required.' })
            }   
            const messages = await Message.find({ conversationId })
            res.status(200).json(messages)
        } catch (error) {
            console.error('Error retrieving messages:', error)
            res.status(500).json({ message: 'Internal server error' })
        }   
    }
}

module.exports = new MessageController();