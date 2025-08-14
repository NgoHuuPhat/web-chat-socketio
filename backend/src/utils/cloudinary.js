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

// Function fix name file
const fixFileName = (filename) => {
    try {
        const buffer = Buffer.from(filename, 'latin1')
        return buffer.toString('utf8')
    } catch (error) {
        return filename
    }
}

const createSafeFileName = (originalName) => {
    const fixedName = fixFileName(originalName)

    const ext = path.extname(fixedName)
    const baseName = path.basename(fixedName, ext)

    const safeBaseName = baseName
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')     
        .replace(/[^\w\d\s\-]+/g, '')         
        .replace(/\s+/g, '-')                
        .replace(/-+/g, '-')            
        .trim()                              
        .toLowerCase()  
    
     return `${safeBaseName}-${uuidv4()}${ext.toLowerCase()}`
}

// Upload a single file to Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const originalName = fixFileName(file.originalname)

        const uploadOptions = { 
            folder: `${file.fieldname}s`,
        }

        // If it's a video or audio file, add resource_type
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
            uploadOptions.resource_type = 'video'
            uploadOptions.chunk_size = 3000000
        } else if (RAW_MIME_TYPES.includes(file.mimetype)) {
            uploadOptions.resource_type = 'raw'
            uploadOptions.public_id = createSafeFileName(originalName)
        }

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (result) {
                    const fileInfo = {
                        ...result,
                        originalName: originalName,
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