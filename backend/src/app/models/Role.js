const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, maxLength: 600 },
    },
    { timestamps: true },
)

module.exports = mongoose.model('Role', RoleSchema) // Collection - Schema