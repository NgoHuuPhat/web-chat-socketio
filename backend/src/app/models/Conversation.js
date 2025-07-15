const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConversationSchema = new Schema(
    {
        isGroup: { type: Boolean, default: false }, 
        groupName: { type: String, default: null },
        groupAvatar: { type: String, default: null },
        members: [{ type: Schema.Types.ObjectId, ref: 'Account', required: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
        lastMessageTime: { type: Date, default: Date.now },
    }, 
    { timestamps: true }
)

module.exports = mongoose.model('Conversation', ConversationSchema) 