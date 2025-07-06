const userRouter = require('./user')
const authRouter = require('./auth')

const authMiddleware = require('../app/middlewares/authMiddleware')

function router(app) {
    app.use('/api/user', authMiddleware, userRouter)
    app.use('/api/auth', authRouter)
}

module.exports = router