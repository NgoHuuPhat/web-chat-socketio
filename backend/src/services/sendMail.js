const nodemailer = require('nodemailer')

module.exports.sendMail = (email, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    })
    
    async function main() {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email, 
            text: text,
            subject: subject,
            html: html, 
        })
        console.log('Message sent: %s', info.messageId)
    }
    main().catch(console.error)
}
