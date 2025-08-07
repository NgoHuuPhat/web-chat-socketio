module.exports = (io, socket) => {
    socket.on('join_conversation', (conversationId) => {
        console.log(`User ${socket.id} joined conversation: ${conversationId}`)
        socket.join(conversationId)
    })

    socket.on('send_message', (message) => {
        const { conversationId } = message
        socket.to(conversationId).emit('receive_message', message)
    })

}