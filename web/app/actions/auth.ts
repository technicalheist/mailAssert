'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        const email = formData.get('email') as string

        // Check if email is verified before attempting login
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (user && !user.emailVerified) {
            return 'Please verify your email before logging in. Check your inbox for the verification link.'
        }

        // Convert FormData to object and include redirectTo
        const signInData = Object.fromEntries(formData)
        await signIn('credentials', {
            ...signInData,
            redirectTo: '/dashboard'
        })

        // Send login notification if enabled (after successful login)
        if (user && user.notificationEnabled && user.notifyOnLogin) {
            // Import dynamically to avoid circular dependencies
            const { sendEmail } = await import('@/lib/email')
            const { loginNotificationTemplate } = await import('@/lib/email-templates')

            const emailHtml = loginNotificationTemplate({
                userName: user.name || user.email.split('@')[0],
                email: user.email,
                loginTime: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                }),
                ipAddress: undefined, // TODO: Get from request headers
                userAgent: undefined, // TODO: Get from request headers
                location: undefined   // TODO: Get from IP geolocation
            })

            // Send email asynchronously (don't wait for it)
            sendEmail({
                to: user.email,
                subject: 'New Login Detected - MailAssert',
                html: emailHtml
            }).catch(err => console.error('Failed to send login notification:', err))
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return 'Name, email and password are required'
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return 'Email already registered'
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    try {
        const newUser = await prisma.user.create({
            data: {
                name: name || null,
                email,
                phone: phone || null,
                password: hashedPassword,
                inboxes: {
                    create: {
                        inboxId: Math.random().toString(36).substring(2, 8),
                        name: "Main Inbox",
                    },
                },
            },
        })

        // Generate email verification token
        const crypto = require('crypto')
        const verificationToken = crypto.randomBytes(32).toString('hex')

        await prisma.emailVerificationToken.create({
            data: {
                userId: newUser.id,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
            },
        })

        // Send verification email
        const { sendEmail } = await import('@/lib/mail')
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to MailAssert!</h2>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for registering with MailAssert. Please verify your email address to activate your account.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            </div>
        `

        await sendEmail({
            to: email,
            subject: 'Verify Your Email - MailAssert',
            html: emailContent,
        })

        // Return success message - redirect will be handled by the component
        return 'SUCCESS: Please check your email to verify your account'
    } catch (e) {
        console.error(e)
        return 'Failed to create user'
    }
}

export async function logout() {
    await signOut({ redirectTo: '/login' })
}
