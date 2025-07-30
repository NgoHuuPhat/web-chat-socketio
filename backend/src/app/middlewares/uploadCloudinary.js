const { uploadToCloudinary } = require('../../utils/cloudinary')

module.exports = function (req, res, next) {
    const processUploads = async (req, res, next) => {
        try {
            
            if (!req.file && !req.files) {
                return next()
            }

            if (req.file) {
                console.log(`  🔄 Uploading single file: ${req.file.originalname}`)
                const result = await uploadToCloudinary(req.file)
                req.uploadResults = result
                return next()
            }

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ message: 'No files uploaded.' })
            }

            const uploadPromises = []
            const fileMapping = []

            for (const fieldName in req.files) {
                const files = req.files[fieldName]

                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    console.log(`  🔄 Uploading file [${fieldName}][${i}]: ${file.originalname}`)
                    uploadPromises.push(uploadToCloudinary(file))
                    fileMapping.push({ fieldName, index: i })
                }
            }

            const results = await Promise.all(uploadPromises)

            req.uploadResults = {}

            results.forEach((result, index) => {
                const { fieldName } = fileMapping[index]
                if (!req.uploadResults[fieldName]) {
                    req.uploadResults[fieldName] = []
                }
                req.uploadResults[fieldName].push(result)
            })

            next()
        } catch (error) {
            console.error("❌ Error during upload:", error)
            res.status(500).json({ message: "Error uploading files to Cloudinary.", error: error.message })
        }
    }

    processUploads(req, res, next)
}
