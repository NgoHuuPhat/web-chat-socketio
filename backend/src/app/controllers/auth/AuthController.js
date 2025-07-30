const Account = require('../../models/Account')
const ForgotPassword = require('../../models/ForgotPassword')
const Role = require('../../models/Role')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sendMailHelper = require('../../../services/sendMail')

class AuthController {
    //[POST] /api/auth/register
    async registerPost(req, res) {
        try {
            // Default roleId is 'auth'
            const role = await Role.findOne({ name: 'user' })

            // Check email exists
            const emailExists = await Account.findOne({ email: req.body.email })
            if (emailExists) {
                return res.status(400).json({
                    message: 'Email already exists. Please use a different email.',
                })
            }

            // Check password length
            if (req.body.password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long.',
                })
            }

            // Check confirm password
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({
                    message: 'Passwords do not match. Please try again.',
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
            console.error('Registration error:', error)
            res.status(500).json({
                message: 'An error occurred during registration. Please try again later.',
            })
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

            // Update is online 
            checkEmail.isOnline = true
            await checkEmail.save()

            // Create Access Token
            const payload = {
                id: checkEmail._id,
                email: checkEmail.email,
                fullName: checkEmail.fullName,
                avatar: checkEmail.avatar,
                roleId: checkEmail.roleId,
                slug: checkEmail.slug,
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

            // Set cookies
            res.cookie('accessToken', accessToken, { httpOnly: true })
            res.cookie('refreshToken', refreshToken, { httpOnly: true })

            const role = await Role.findById(checkEmail.roleId).select('name')

            res.status(200).json({
                message: 'Login successful!',
                auth: {
                    id: checkEmail._id,
                    fullName: checkEmail.fullName,
                    email: checkEmail.email,
                    avatar: checkEmail.avatar,
                    roleId: checkEmail.roleId,
                    roleName: role.name,
                    slug: checkEmail.slug,
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
    async logout(req, res) {
        try {
            const userId = req.user.id

            // Update user's isOnline status to false
            await Account.findByIdAndUpdate(userId, { isOnline: false, lastOnline: new Date() }, { new: true })

            // Delete accessToken - refreshToken from cookie
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            res.status(200).json({
                message: 'Logout successful!',
            })
        } catch (error) {
            console.error('Logout error:', error)
            res.status(500).json({
                message: 'An error occurred during logout. Please try again later.',
            })
        }
    }

    //[POST] /api/auth/refresh-token
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
                slug: decode.slug,
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

    //[POST] /api/auth/forgot-password
    async forgotPasswordPost(req, res) {
        try {
            const { email } = req.body

            // Check email exists in database
            const account = await Account.findOne({ email })
            if (!account) {
                return res.status(404).json({
                    message: 'Email does not exist. Please register first.',
                })
            }

            const otp = Math.floor(100000 + Math.random() * 900000) 
            const forgotPassword = {
                email,
                otp
            }
            await ForgotPassword.create(forgotPassword)

            // Send OTP to user's email
            const subject = 'Xác thực OTP lấy lại mật khẩu'
            const text = `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 3 phút.`
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007bff;">🔐 Xác thực OTP</h2>
                    <p>Mã OTP của bạn là:</p>
                    <h1 style="letter-spacing: 5px; font-size: 36px; color: #e74c3c; margin: 10px 0;">${otp}</h1>
                    <p style="margin-top: 20px;">⏳ Mã sẽ hết hạn sau <b>3 phút</b>.</p>
                    <hr style="margin: 20px 0;" />
                    <p style="font-size: 12px; color: gray;">⚠️ Không chia sẻ mã với bất kỳ ai, kể cả nhân viên hỗ trợ.</p>
                </div>
            `
            await sendMailHelper.sendMail(email, subject, text, html)

            res.status(200).json({
                message: 'OTP has been sent to your email. Please check your mailbox.',
            })
        } catch (error) {
            console.error('Forgot password error:', error)
            res.status(500).json({
                message: 'An error occurred while processing your request. Please try again later.',
            })
        }
    }

    //[POST] /api/auth/verify-otp
    async verifyOTPPost(req, res) {
        try {
            const { email, otp } = req.body

            // Check result in ForgotPassword collection
            const result = await ForgotPassword.findOne({ email, otp })

            if (!result) {
                return res.status(400).json({
                    message: 'OTP is invalid or expired. Please try again.',
                })
            }

            await ForgotPassword.deleteMany({ email }) 

            // Create reset token
            const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })
            res.cookie('resetToken', resetToken, { httpOnly: true })

            res.status(200).json({
                message: 'OTP verified successfully! You can now reset your password.',
            })
        } catch (error) {
            console.error('Verify OTP error:', error)
            res.status(500).json({
                message: 'An error occurred while verifying the OTP. Please try again later.',
            })
        }
    }

    //[POST] /api/auth/reset-password
    async resetPasswordrPost(req, res) {
        try {
            // Check resetToken in cookie
            if (!req.cookies.resetToken) {
                return res.status(401).json({
                    message: 'Reset token is missing. Please request a new OTP.',
                })
            }

            let decoded
            try {
                decoded = jwt.verify(req.cookies.resetToken, process.env.JWT_SECRET)
            } catch (error) {
                return res.status(403).json({
                    message: 'Invalid reset token. Please request a new OTP.',
                })
            }
            
            const { password, confirmPassword } = req.body
            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: 'Passwords do not match. Please try again.',
                })
            }

            if( password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long.',
                })
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            await Account.updateOne({ email: decoded.email }, 
                { password: hashedPassword }
            )

            res.clearCookie('resetToken') 
            res.status(200).json({
                message: 'Password reset successfully! You can now login with your new password.',
            })
        } catch (error) {
            res.status(500).json({
                message: 'An error occurred while resetting the password. Please try again later.',
            })
            console.error('Reset password error:', error)

        }
    }

    //[GET] /api/auth/check-auth
    async checkAuth(req, res) {
       try {
            const user = await Account.findById(req.user.id).populate('roleId', 'name')
            if (!user) {
                return res.status(404).json({
                    message: 'User not found. Please login again.',
                })
            }

            res.status(200).json({
                id: user._id,
                roleName: user.roleId.name,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                roleId: user.roleId._id,
                slug: user.slug,
            })
       } catch (error) {
            console.error('Check auth error:', error)
            res.status(500).json({
                message: 'An error occurred while checking authentication. Please try again later.',
            })
       }
    }
}

module.exports = new AuthController()
