const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ForgotPasswordSchema = new Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expireAt: { type: Date, default: Date.now, expires: 180 },
    },
    { timestamps: true },
)

module.exports = mongoose.model('ForgotPassword', ForgotPasswordSchema) // Collection - Schema
