const User = require('../../models/Account')

class UserController {
    // [GET] /api/users
    async getUsers(req, res) {
        try {
            const users = await User.find({_id: {$ne: req.user.id}})
            res.status(200).json(users)
        } catch (error) {
            console.error('Error fetching users:', error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    // [GET] /api/users/search
    async searchUsers(req, res) {
        try {
            const search = req.query.q || ''
            const regex = new RegExp(search, 'i') 
            const userId = req.user._id

            const users = await User.find({
                fullName: regex,
                _id: {$ne: userId}
            })

            res.status(200).json(users)

        } catch (error) {
            console.error('Error searching users:', error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new UserController();