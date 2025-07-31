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
            const userId = req.user.id

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

    // [GET] /api/users/:slug
    async getProfileBySlug(req, res) {
        try {

            const slug = req.params.slug
            const user = await User.findOne({ slug }).populate('roleId', 'name')

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            if(user.roleId.name === 'admin') {
                return res.status(403).json({ message: 'Access denied' })
            }  

            if(user.status === 'inactive') {
                return res.status(403).json({ message: 'Your account is inactive' })
            }

            res.status(200).json(user)

        } catch (error) {
           console.error('Error fetching user profile:', error)
           return res.status(500).json({ message: 'Internal server error' }) 
        }
    }

    // [PATCH] /api/users/profile
    async updateProfile(req, res) {
        try {

            const dataUpdate = {...req.body}

            if (req.body.fullName) {
                dataUpdate.fullName = req.body.fullName.trim()
            }

            if (req.body.phone) {
                dataUpdate.phone = req.body.phone.trim()
            }

            if(req.uploadResults){
                dataUpdate.avatar = req.uploadResults.secure_url
            }

            if(req.body.bio){
                dataUpdate.bio = req.body.bio.trim()
            }

            if(req.body.location){
                dataUpdate.location = req.body.location.trim()
            }

            if(req.body.birthDate) {
                dataUpdate.birthDate = new Date(req.body.birthDate)
            }

            if(Object.keys(dataUpdate).length === 0) {
                return res.status(400).json({ message: 'No data to update' })
            }

            const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, dataUpdate, { new: true })

            res.status(200).json({
                message: 'Profile updated successfully',
                user: updatedUser
            })
        } catch (error) {
           console.error('Error updating user profile:', error)
           return res.status(500).json({ message: 'Internal server error' })
        }
    }
}

module.exports = new UserController();