'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import prisma from '@/lib/prisma'
import { nextId } from "@/lib/ids";
import bcrypt from 'bcrypt'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Check if email is verified before attempting login
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (user && !user.emailVerified) {
            return 'Please verify your email before logging in. Check your inbox for the verification link.'
        }

        // Sign in WITHOUT redirectTo — we let the client handle the redirect.
        // This prevents NextAuth from throwing a NEXT_REDIRECT which would
        // leave useActionState's isPending=true forever (the root cause of the infinite spinner).
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        // If we reach here, sign in was successful.
        // Send login notification if enabled
        if (user && user.notificationEnabled && user.notifyOnLogin) {
            const { sendEmail } = await import('@/lib/email')
            const { loginNotificationTemplate } = await import('@/lib/email-templates')

            const emailHtml = loginNotificationTemplate({
                userName: user.name || user.email.split('@')[0],
                email: user.email,
                loginTime: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                }),
                ipAddress: undefined,
                userAgent: undefined,
                location: undefined
            })

            sendEmail({
                to: user.email,
                subject: 'New Login Detected - MailAssert',
                html: emailHtml
            }).catch(err => console.error('Failed to send login notification:', err))
        }

        // Return a success sentinel — the client will use this to redirect
        return 'REDIRECT:/dashboard'
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
                id: await nextId("user"),
                name: name || null,
                email,
                phone: phone || null,
                password: hashedPassword,
                inboxes: {
                    create: {
                        id: await nextId("inbox"),
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
                id: await nextId("emailVerificationToken"),
                userId: newUser.id,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
            },
        })

        // Send verification email
        const { sendEmail } = await import('@/lib/mail')
        const { emailVerificationTemplate } = await import('@/lib/email-templates')

        // Use current request domain if available, otherwise fallback to NEXTAUTH_URL
        let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        try {
            const { headers } = await import('next/headers')
            const host = (await headers()).get('host')
            const protocol = (await headers()).get('x-forwarded-proto') || 'http'
            if (host) {
                baseUrl = `${protocol}://${host}`
            }
        } catch (e) {
            console.error('Failed to get headers for dynamic URL:', e)
        }

        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

        const emailHtml = emailVerificationTemplate({
            userName: name || email.split('@')[0],
            verificationUrl
        })

        await sendEmail({
            to: email,
            subject: 'Verify Your Email - MailAssert',
            html: emailHtml,
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

