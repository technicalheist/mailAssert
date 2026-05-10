import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: Number(process.env.MAIL_PORT),
    secure: false, // true for 465, false for other ports (587 usually uses STARTTLS)
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
})

export async function sendEmail({
    to,
    subject,
    text,
    html,
}: {
    to: string
    subject: string
    text?: string
    html?: string
}) {
    const mailOptions = {
        from: process.env.MAIL_DEFAULT_SENDER,
        to,
        subject,
        text,
        html: html || text,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${to}`)
        return { success: true }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error }
    }
}
