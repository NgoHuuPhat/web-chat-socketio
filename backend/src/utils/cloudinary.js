const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const RAW_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
]

// Upload a single file to Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = { 
            folder: `${file.fieldname}s`,
        }

        // If it's a video or audio file, add resource_type
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
            uploadOptions.resource_type = 'video'
            uploadOptions.chunk_size = 3000000
        } else if (RAW_MIME_TYPES.includes(file.mimetype)) {
            uploadOptions.resource_type = 'raw'

            const ext = path.extname(file.originalname)
            const baseName = path.basename(file.originalname, ext)

            uploadOptions.public_id = `${baseName}-${uuidv4()}${ext}`
        }

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (result) {
                    const fileInfo = {
                        ...result,
                        originalName: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                    }
                    resolve(fileInfo)
                } else {
                    reject(error)
                }
            }
        )
        streamifier.createReadStream(file.buffer).pipe(stream)
    })
}

module.exports = {
    uploadToCloudinary
}