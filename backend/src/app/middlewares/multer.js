const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 

        'video/mp4', 

        'audio/mpeg', 
        'audio/mp3', 

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
        cb(null, true) 
    } else {
        cb(new Error('Unsupported file type'), false) 
    }
}

const upload = multer({ storage, fileFilter })

module.exports = upload