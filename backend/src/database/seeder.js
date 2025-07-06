const mongoose = require('mongoose')
const Role = require('../app/models/Role')
const Account = require('../app/models/Account')
const bcrypt = require('bcrypt')

const autoSeed = async () => {
    try {

        // Check if admin and user role already exists
        let adminRole = await Role.findOne({ name: 'admin' })
        let userRole = await Role.findOne({ name: 'user' })

        if(!adminRole) {
            adminRole = await Role.create({
                name: 'admin',
                description: 'Quản trị viên hệ thống',
            })
        } else {
            console.log('Role admin already exists, skipping creation.')
        }

        if(!userRole) {
            userRole = await Role.create({
                name: 'user',
                description: 'Người dùng hệ thống',
            })
        } else {
            console.log('Role user already exists, skipping creation.')
        }

        // Check if admin account already exists
        const adminEmail = 'admin@example.com'
        let adminAccount = await Account.findOne({ email: adminEmail })
        if(adminAccount) {
            console.log('Admin account already exists, skipping creation.')
            return
        } else {
            const hashPassword = await bcrypt.hash('admin123', 10)

            await Account.create({
                fullName: 'Super Admin',
                email: adminEmail,
                password: hashPassword,
                phone: '0123456789',
                roleId: adminRole._id,
                status: 'active',
            })
        }

        console.log('Seed data successfully!')  
    } catch (error) {
        console.error('Error seeding data:', error)
    }
}
module.exports = { autoSeed }