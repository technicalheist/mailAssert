import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
})

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter verification failed:', error)
    } else {
        console.log('Email server is ready to send messages')
    }
})

export interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"MailAssert" <${process.env.MAIL_DEFAULT_SENDER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        })

        console.log('Email sent successfully:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error: String(error) }
    }
}

// Test email function (for debugging)
export async function sendTestEmail(to: string) {
    return sendEmail({
        to,
        subject: 'Test Email from MailAssert',
        html: '<h1>Test Email</h1><p>If you received this, your email configuration is working!</p>',
    })
}
