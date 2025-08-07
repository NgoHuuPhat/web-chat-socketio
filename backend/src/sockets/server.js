const { Server } = require('socket.io')
const chatHandler = require('./handlers/chatHandler')

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    })

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)
        chatHandler(io, socket)
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })

    return io
}

module.exports = setupSocket