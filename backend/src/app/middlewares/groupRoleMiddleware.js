const Conversation = require('../models/Conversation')

module.exports = function groupRoleMiddleware(requiredRoles){
    return async (req, res, next) => {
        try {
            const userId = req.user.id
            const conversationId = req.params.conversationId

            if(!conversationId){
                return res.status(400).json({ message: 'Conversation ID is required.' })
            }

            const conversation = await Conversation.findById(conversationId)
            if(!conversation){
                return res.status(404).json({ message: 'Conversation not found.' })
            }

            const member = conversation.members.find(m => m.userId.toString() === userId)
            if(!member){
                return res.status(403).json({ message: 'You are not a member of this group.' })
            }

            if(!requiredRoles.includes(member.role)){
                return res.status(403).json({ message: 'You do not have the required role to perform this action.' })
            }
            next()
        } catch (error) {
            console.error('Error in groupRoleMiddleware:', error)
            res.status(500).json({ message: 'Internal server error.' })
        }
    }
}