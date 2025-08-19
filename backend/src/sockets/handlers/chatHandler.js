const Conversation = require('../../app/models/Conversation')

module.exports = (io, socket) => {
    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId)
    })
    
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId)
    })

    socket.on('send_message', async (message) => {
        const { conversationId } = message
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()

        // Emit to other users who have not opened the conversation
        socket.to(conversationId).emit('receive_message', message)

        if (conversation) {
            conversation.members.forEach(member => {
                const memberId = member.userId.toString()
                if (memberId !== senderId) {
                    socket.to(memberId).emit('new_message_notification', {
                       ...message,
                       unreadCount: conversation.unreadCount.get(memberId) || 0
                    })
                }
            })
        }
    })

    socket.on('delete_message', ({messageId, conversationId, messageType, attachments}) => {
        socket.to(conversationId).emit('message_deleted', { messageId, conversationId, messageType, attachments })
    })

    socket.on('pin_message', (message) => {
        const { conversationId } = message
        socket.to(conversationId).emit('message_pinned', message )
    })
    socket.on('unpin_message', ({ messageId, conversationId }) => {
        socket.to(conversationId).emit('message_unpinned', { messageId, conversationId })
    })

    socket.on('update_group_avatar', async ({ conversationId, groupAvatar }) => {        
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()

        socket.to(conversationId).emit('update_group_avatar', { conversationId, groupAvatar })

        if (conversation) {
            conversation.members.forEach(member => {
                const memberId = member.userId.toString()
                if (memberId !== senderId) {
                    socket.to(memberId).emit('update_group_avatar', { conversationId, groupAvatar })
                }
            })
        }
    })

    socket.on('update_group_name', async ({ conversationId, groupName }) => {
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()
        
        socket.to(conversationId).emit('update_group_name', { conversationId, groupName })

        if (conversation) {
            conversation.members.forEach(member => {
                const memberId = member.userId.toString()
                if (memberId !== senderId) {
                    socket.to(memberId).emit('update_group_name', { conversationId, groupName })
                }
            })
        }
    })
}