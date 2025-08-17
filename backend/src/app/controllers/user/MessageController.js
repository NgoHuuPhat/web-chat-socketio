const User = require('../../models/Account')
const Message = require('../../models/Message')
const Conversation = require('../../models/Conversation')
const cloudinary = require('../../../config/cloudinary')

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
                messageType: 'text',
                status: 'sent'
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
                    conversationId: conversation._id,
                    status: message.status
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
            const messages = await Message.findWithDeleted({ conversationId }).populate('seenBy.userId', 'fullName avatar')

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

            // Optionally, you can also remove the message from the conversation's lastMessage
            const conversation = await Conversation.findById(message.conversationId)
            if (conversation.lastMessage && conversation.lastMessage.toString() === id) {
                const lastMessage = await Message.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(1)
                conversation.lastMessage = lastMessage ? lastMessage._id : null
                conversation.lastMessageTime = lastMessage ? lastMessage.createdAt : null
                await conversation.save()
            }

            await message.delete()

            res.status(200).json({ 
                message: 'Message recalled successfully.',
                data: { 
                    _id: message._id,
                    deleted: true,
                    createdAt: message.createdAt
                }
            })
        } catch (error) {
            console.error('Error deleting message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [POST] /api/messages/media
    async sendMediaMessage(req, res) {
        try {
            const { conversationId } = req.body
            const senderId = req.user.id

            if (!conversationId) {
                return res.status(400).json({ message: 'Conversation ID is required.' })
            }

            const conversation = await Conversation.findById(conversationId)
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            if(!conversation.members.includes(senderId)) {
                return res.status(403).json({ message: 'You are not a member of this conversation.' })
            }

            // Check uploaded files
            if (!req.uploadResults || Object.keys(req.uploadResults).length === 0) {
                return res.status(400).json({ message: 'No files uploaded.' })
            }

            const attachments = []
            for (const fieldName in req.uploadResults) {
                const uploads = req.uploadResults[fieldName]

                for(const upload of uploads) {
                    let attachmentType = 'file'
                    switch (fieldName) {
                        case 'image':
                            attachmentType = 'image'
                            break
                        case 'video':
                            attachmentType = 'video'
                            break
                        case 'audio':
                            attachmentType = 'audio'
                            break
                        default:
                            attachmentType = 'file'
                            break
                    }

                    const attachment = {
                        type: attachmentType,
                        url: upload.secure_url,
                        publicId: upload.public_id,
                        originalName: upload.originalName,
                        mimetype: upload.mimetype,
                        size: upload.size
                    }

                    if(upload.width && upload.height) {
                        attachment.dimensions = {
                            width: upload.width,
                            height: upload.height
                        }
                    }

                    if(attachmentType === 'video' && upload.public_id) {
                        attachment.thumbnailUrl = cloudinary.url(upload.public_id, {
                            resource_type: 'video',
                            width: 300,
                            height: 200,
                            crop: 'limit',
                            format: 'jpg'
                        })
                    }

                    if(upload.duration) {
                        attachment.duration = upload.duration
                    }

                    attachments.push(attachment)
                }
            }

            const message = await Message.create({
                conversationId: conversation._id,
                senderId,
                content: '', 
                attachments: attachments,
                messageType: 'media'
            })

            // Update unread count for the sender
            conversation.members.forEach(member => {
                if (member.toString() !== senderId) {
                    const currentCount = conversation.unreadCount.get(member.toString()) || 0
                    conversation.unreadCount.set(member.toString(), currentCount + 1)
                }
            })

            // Update conversation with the latest message
            conversation.lastMessage = message._id
            conversation.lastMessageTime = new Date()
            await conversation.save()

            res.status(201).json(message)
        } catch (error) {
            console.error('Error sending media message:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new MessageController();