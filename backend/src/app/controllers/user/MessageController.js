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


            // Update unread count for the sender
            conversation.members.forEach(member => {
                if( member.toString() !== senderId) {
                    const currentCount = conversation.unreadCount.get(member.toString()) || 0
                    conversation.unreadCount.set(member.toString(), currentCount + 1)
                }
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
            const messages = await Message.findWithDeleted({ conversationId })
            res.status(200).json(messages)
        } catch (error) {
            console.error('Error retrieving messages:', error)
            res.status(500).json({ message: 'Internal server error' })
        }   
    }

    // [DELETE] /api/messages/:id
    async deleteMessage(req, res) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).json({ message: 'Message ID is required.' })
            }   

            const message = await Message.findById(id)
            if (!message) {
                return res.status(404).json({ message: 'Message not found.' })
            } 
            if( message.senderId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You can only delete your own messages.' })
            }

            await message.delete()

            // Optionally, you can also remove the message from the conversation's lastMessage
            const conversation = await Conversation.findById(message.conversationId)
            if (conversation.lastMessage && conversation.lastMessage.toString() === id) {
                const lastMessage = await Message.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(1)
                conversation.lastMessage = lastMessage ? lastMessage._id : null
                conversation.lastMessageTime = lastMessage ? lastMessage.createdAt : null
                await conversation.save()
            }

            res.status(200).json({ 
                message: 'Message recalled successfully.',
                data: { 
                    _id: message._id,
                    deleted: true   
                }
            })
        } catch (error) {
            console.error('Error deleting message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new MessageController();