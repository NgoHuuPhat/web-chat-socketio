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
                    enum: ['image', 'video', 'file', 'audio'],
                    default: 'image',
                },
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                originalName: { type: String },
                mimetype: { type: String},
                size: { type: Number },
                thumbnailUrl: { type: String },
                duration: { type: Number }, 
                dimensions: {
                    width: { type: Number },
                    height: { type: Number }
                }
            }
        ],
        messageType: {
            type: String,
            enum: ['text', 'media', 'system'],
            default: 'text'
        },
        status: {
            type: String,
            enum: ['sent', 'received', 'seen'],
            default: 'sent'
        },
        seenBy: [{
            userId: { type: Schema.Types.ObjectId, ref: 'Account' },
            seenAt: { type: Date }
        }],
        
    },
    { timestamps: true }
)

MessageSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
})

module.exports = mongoose.model('Message', MessageSchema) 