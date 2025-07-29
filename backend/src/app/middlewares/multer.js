const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 

        'video/mp4', 

        'audio/webm',
        'audio/mpeg', 
        'audio/mp3', 
        'audio/wav',
        'audio/ogg',
        'audio/x-m4a',

        'application/pdf',
        'text/plain',

        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',

        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]

    if (allowedTypes.includes(file.mimetype)) {
        console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`)
        cb(null, true) 
    } else {
        cb(new Error('Unsupported file type'), false) 
    }
}

const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB limit
    }
 })

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size exceeds the limit of 100 MB.' })
        }

        return res.status(400).json({ message: `Multer error: ${err.message}` })
    } else if (err) {
        return res.status(500).json({ message: `Server error: ${err.message}` })
    }

    next()
}

module.exports = {
    upload,
    handleMulterError
}