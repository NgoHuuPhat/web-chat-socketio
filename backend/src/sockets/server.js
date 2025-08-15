const { Server } = require('socket.io')
const chatHandler = require('./handlers/chatHandler')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const Account = require('../app/models/Account')

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    })

    // Map user online
    const onlineUsers = new Map()   

    // Middleware to authenticate the user using JWT from cookies
    io.use((socket, next) => {
        try {
            const token = cookie.parse(socket.handshake.headers.cookie || '').accessToken

            if (!token) {
                return next(new Error('Authentication error:'))
            }

            const user = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = user
            next()
        } catch (error) {
            console.error('Error parsing cookie:', error)
            return next(new Error('Authentication error'))
        }
    })

    io.on('connection', async (socket) => {
        const userId = socket.user.id.toString()
        
        socket.join(userId)

        if(!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
        onlineUsers.get(userId).add(socket.id)

        if(onlineUsers.get(userId).size === 1) {
            socket.broadcast.emit('user_online', { userId })
            try {
                await Account.findByIdAndUpdate(userId, { isOnline: true })
            } catch (error) {
                console.error('Error updating user_online status:', error)
            }
        }

        chatHandler(io, socket)

        socket.on('disconnect', async () => {
            if(!onlineUsers.get(userId)) return

            onlineUsers.get(userId).delete(socket.id)

            if(onlineUsers.get(userId).size === 0){
                onlineUsers.delete(userId)
                socket.broadcast.emit('user_offline', { userId })
                try {
                    await Account.findByIdAndUpdate(userId, { isOnline: false, lastOnline: new Date() })
                } catch (error) {
                    console.error('Error broadcasting user_offline event:', error)
                }
            }
        })
    })

    return io
}

module.exports = setupSocket