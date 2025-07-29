const authRouter = require('./auth')
// const adminRouter = require('./admin')
const messageRouter = require('./messages')
const userRouter = require('./user')
const conversationRouter = require('./conversations')

const authMiddleware = require('../app/middlewares/authMiddleware')
const authorMiddleware = require('../app/middlewares/authorMiddleware')

function router(app) {
    app.use('/api/users', userRouter)
    app.use('/api/conversations', authMiddleware, conversationRouter)
    app.use('/api/messages', authMiddleware, messageRouter)
    app.use('/api/auth', authRouter)
    // app.use('/api/admin', authMiddleware, authorMiddleware, adminRouter)
}

module.exports = router