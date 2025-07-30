const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slug = require('mongoose-slug-updater')

const AccountSchema = new Schema(
    {
        fullName: { type: String, required: true },
        slug: { type: String, slug: 'fullName', unique: true },
        email: { type: String, required: true, unique: true },
        password: { 
            type: String, 
            required: function() {
                return this.loginType === 'local'
            },
            minlength: [6, 'Password must be at least 6 characters long'],
         },
        phone: { type: String },
        avatar: { type: String, default: process.env.DEFAULT_AVATAR },
        bio: { type: String },
        roleId: { type : mongoose.Schema.ObjectId, ref: 'Role', required: true }, 
        status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
        loginType: { type: String, enum:['local','google','facebook'], required: true, default: 'local' },
        isOnline: { type: Boolean, default: false },
        lastOnline: { type: Date }
    },
    { timestamps: true },
)

mongoose.plugin(slug)

module.exports = mongoose.model('Account', AccountSchema)