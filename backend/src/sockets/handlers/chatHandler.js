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
        socket.to(conversationId).emit('receive_message', message)

        // Emit to other users who have not opened the conversation
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()

        if (conversation) {
            conversation.members.forEach(memberId => {
                if (memberId.toString() !== senderId) {
                    socket.to(memberId.toString()).emit('new_message_notification', {
                       ...message,
                       unreadCount: conversation.unreadCount.get(memberId.toString()) || 0
                    })
                }
            })
        }
    })

}