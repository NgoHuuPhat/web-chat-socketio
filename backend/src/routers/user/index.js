const homeRouter = require('./home')
const userRouter = require('./user')

const authMiddleware = require('../../app/middlewares/authMiddleware')

function router(app) {
    app.use('/api/user', userRouter)
    app.use('/api/home', authMiddleware, homeRouter)

}

module.exports = router