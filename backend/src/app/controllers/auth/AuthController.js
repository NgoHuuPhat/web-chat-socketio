const Account = require('../../models/Account')
const Role = require('../../models/Role')
var jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

class AuthController {
    //[POST] /api/auth/register
    async registerPost(req, res) {
        try {
            // Default roleId is 'auth'
            const role = await Role.findOne({ name: 'user' })

            // Check email exists
            const emailExists = await Account.findOne({ email: req.body.email })
            if (emailExists) {
                res.status(400).json({
                    message: 'Email already exists. Please use a different email.',
                })
            }

            //Hash password
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            const newAccount = {
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                roleId: role._id,
                status: 'active',
            }

            await Account.create(newAccount)
            res.status(201).json({ message: 'Account created successfully!' })
        } catch (error) {
            next(error)
        }
    }

    //[POST] /api/auth/login
    async loginPost(req, res) {
        try {
            const { email, password } = req.body
            const checkEmail = await Account.findOne({ email: email })

            // Check Email
            if (!checkEmail) {
                return res.status(404).json({
                    message: 'Email does not exist. Please register first.',
                })
            }

            // Check password
            const match = await bcrypt.compare(password, checkEmail.password)
            if (!match) {
                return res.status(401).json({
                    message: 'Incorrect password. Please try again.',
                })
            }

            // Check status
            if (checkEmail.status == 'inactive') {
                return res.status(403).json({
                    message: 'Your account is inactive. Please contact support.',
                })
            }

            // Create Access Token
            const payload = {
                id: checkEmail._id,
                email: checkEmail.email,
                fullName: checkEmail.fullName,
                avatar: checkEmail.avatar,
                roleId: checkEmail.roleId,
            }

            // RememberMe = true/false
            const rememberMe = req.body.rememberMe === 'on' 

            // Create accessToken - refreshToken
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })
            const refreshToken = jwt.sign(
                payload,
                process.env.JWT_REFRESH_SECRET,
                {
                    expiresIn: rememberMe
                        ? process.env.JWT_REMEMBER_REFRESH_EXPIRE
                        : process.env.JWT_REFRESH_EXPIRE,
                },
            )

            // Save accessToken - refreshToken to cookie
            res.cookie('accessToken', accessToken, { httpOnly: true })
            res.cookie('refreshToken', refreshToken, { httpOnly: true })

            res.status(200).json({
                message: 'Login successful!',
                auth: {
                    id: checkEmail._id,
                    fullName: checkEmail.fullName,
                    email: checkEmail.email,
                    avatar: checkEmail.avatar,
                    roleId: checkEmail.roleId,
                },
            })
        } catch (error) {
            console.error('Login error:', error)
            res.status(500).json({
                message: 'An error occurred during login. Please try again later.',
            })
        }
    }

    //[GET] /api/auth/logout
    logout(req, res) {
        // Delete accessToken - refreshToken from cookie
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(200).json({
            message: 'Logout successful!',
        })
    }

    //[POST] /refresh-token
    async refreshToken(req, res) {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.status(401).json({
                message: 'Refresh token is missing. Please login again.',
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

            const payload = {
                id: decode.id,
                email: decode.email,
                fullName: decode.fullName,
                avatar: decode.avatar,
                roleId: decode.roleId,
            }

            const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })

            res.json({ accessToken: newAccessToken })
        } catch (error) {
            console.error('Refresh token error:', error)
            res.status(403).json({
                message: 'Invalid refresh token. Please login again.',
            })
        }
    }


}

module.exports = new AuthController()
