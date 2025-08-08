const { Server } = require('socket.io')
const chatHandler = require('./handlers/chatHandler')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    })

    // Middleware to authenticate the user using JWT from cookies
    io.use((socket, next) => {
        try {
            const token = cookie.parse(socket.handshake.headers.cookie || '').accessToken

            if (!token) {
                return next(new Error('Authentication error'))
            }

            const user = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = user
            next()
        } catch (error) {
            console.error('Error parsing cookie:', error)
            return next(new Error('Authentication error'))
        }
    })

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)
        socket.join(socket.user.id.toString()) 
        chatHandler(io, socket)

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })

    return io
}

module.exports = setupSocket