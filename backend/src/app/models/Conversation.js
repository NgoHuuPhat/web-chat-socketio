const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConversationSchema = new Schema(
    {
        isGroup: { type: Boolean, default: false }, 
        groupName: { type: String, default: null },
        groupImage: { type: String, default: null },
        members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
        lastMessageTime: { type: Date, default: Date.now },
    }, 
    { timestamps: true }
)

module.exports = mongoose.model('Conversation', ConversationSchema) 