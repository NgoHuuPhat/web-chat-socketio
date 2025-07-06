const jwt = require('jsonwebtoken')

module.exports = async function authMiddleware(req, res, next) {
    const token = req.cookies.accessToken   
    let decoded = null

    if (!token) {
        return res.status(401).json({ message: 'Access token not found' })
    }  
    
    try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            try {
                const refreshToken = req.cookies.refreshToken
                if (!refreshToken) {
                    return res.status(401).json({ message: 'Refresh token not found' })
                }

                const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
                    method: 'GET',
                    credentials: 'include', 
                })

                if (!response.ok) {
                    throw new Error('Refresh token request failed')
                }

                const data = await response.json()

                res.cookie('accessToken', data.accessToken, { httpOnly: true })
                decoded = jwt.verify(data.accessToken, process.env.JWT_SECRET)

            } catch (refreshErr) {
                console.log('Access Token Refresh Failed', refreshErr.message)
                return res.status(401).json({ message: 'Access token refresh failed' })
            }
        }
    req.user = decoded
    next()
}
