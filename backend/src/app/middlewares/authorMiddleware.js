module.exports = async function authorMiddleware(req, res, next) {
    if (!req.user || req.user.roleId === 'user') {
        // Delete cookies if they exist
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        return res.status(403).json({ message: 'Access denied. You do not have permission to access this resource.' })
    }
    next()
}
