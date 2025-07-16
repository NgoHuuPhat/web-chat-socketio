const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')

const MessageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
        content: { type: String, default: '' },
        attachments: [
            {
                type: {
                    type: String,
                    enum: ['image', 'file', 'audio'],
                    default: 'image',
                },
                url: String,
            }
        ],
        seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
)

MessageSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
})

module.exports = mongoose.model('Message', MessageSchema) 