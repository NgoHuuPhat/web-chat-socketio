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

    socket.on('update_member_role', async ({ conversationId, memberId, newRole }) => {
        socket.to(conversationId).emit('update_member_role', { conversationId, memberId, newRole })
    })

    socket.on('add_members', async ({ conversationId, newMembers }) => {
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()
        
        socket.to(conversationId).emit('add_members', { conversationId, newMembers })
        if (conversation) {
            conversation.members.forEach(member => {
                const memberId = member.userId.toString()
                if (memberId !== senderId) {
                    socket.to(memberId).emit('add_members', { conversationId, newMembers })
                }
            })
        }
    })
    
    socket.on('remove_member', async ({ conversationId, memberId }) => {
        const conversation = await Conversation.findById(conversationId)
        const senderId = socket.user.id.toString()
        
        socket.to(conversationId).emit('remove_member', { conversationId, memberId })
        if (conversation) {
            conversation.members.forEach(member => {
                const memberIds = member.userId.toString()
                if (memberIds !== senderId) {
                    socket.to(memberIds).emit('remove_member', { conversationId, memberId })
                }
            })
        }
    })

    socket.on('mark_message_as_seen', async ({ conversationId, messageId, userId}) => {
        socket.to(conversationId).emit('message_marked_as_seen', { conversationId, messageId, userId })
    })
}