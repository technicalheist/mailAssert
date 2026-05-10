'use server';

import prisma from "@/lib/prisma";
import nodemailer from 'nodemailer';

export async function submitContactForm(
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData
) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { error: "All fields are required" };
    }

    try {
        // Send email to admin
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_SERVER,
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: process.env.MAIL_USE_TLS === 'true',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_DEFAULT_SENDER,
            to: process.env.ADMIN_EMAIL || process.env.MAIL_USERNAME,
            subject: `Contact Form: ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
            replyTo: email,
        });

        return { success: "Message sent successfully! We'll get back to you soon." };
    } catch (error) {
        console.error('Contact form error:', error);
        return { error: "Failed to send message. Please try again later." };
    }
}
