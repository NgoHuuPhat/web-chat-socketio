const authRouter = require('./auth')
// const adminRouter = require('./admin')
const messageRouter = require('./message')
const userRouter = require('./user')

const authMiddleware = require('../app/middlewares/authMiddleware')
const authorMiddleware = require('../app/middlewares/authorMiddleware')

function router(app) {
    app.use('/api/users', authMiddleware, userRouter)
    app.use('/api/messages', authMiddleware, messageRouter)
    app.use('/api/auth', authRouter)
    // app.use('/api/admin', authMiddleware, authorMiddleware, adminRouter)
}

module.exports = router