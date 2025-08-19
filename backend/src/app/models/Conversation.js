const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConversationSchema = new Schema(
    {
        isGroup: { type: Boolean, default: false }, 
        groupName: { type: String, default: null },
        groupAvatar: { type: String, default: null },
        createdBy: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
        members: [{ 
            user: {
                type: Schema.Types.ObjectId, 
                ref: 'Account', 
                required: true
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
         }],
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
        lastMessageTime: { type: Date, default: Date.now },
        pinnedMessageIds: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
        unreadCount: { type: Map, of: Number, default: {} },
    }, 
    { timestamps: true }
)

module.exports = mongoose.model('Conversation', ConversationSchema) 