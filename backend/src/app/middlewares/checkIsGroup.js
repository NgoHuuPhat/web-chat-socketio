const Conversation = require('../models/Conversation')

const checkIsGroup = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId)
        if(!conversation){
            return res.status(404).json({ message: 'Conversation not found.' })
        }

        if(!conversation.isGroup) {
            return res.status(400).json({ message: 'Only group conversations can have avatars updated.' })
        }

        req.conversation = conversation
        next()

    } catch (error) {
        console.error('Error checking if conversation is group:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = checkIsGroup