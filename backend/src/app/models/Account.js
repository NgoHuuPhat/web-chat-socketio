const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { 
            type: String, 
            required: function() {
                return this.loginType === 'local'
            }
         },
        phone: { type: String },
        avatar: { type: String },
        roleId: { type : mongoose.Schema.ObjectId, ref: 'Role', required: true }, 
        status: { type: String, required: true },
        loginType: { type: String, enum:['local','google','facebook'], required: true, default: 'local' },
    },
    { timestamps: true },
)

module.exports = mongoose.model('Account', AccountSchema) // Collection - Schema