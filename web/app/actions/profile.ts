'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { nextId } from "@/lib/ids";
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    phone: z.string().optional().refine(
        (val) => !val || val.length === 0 || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
        "Invalid phone number format"
    ),
})

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

    // Validate input
    const validation = profileSchema.safeParse({ name, phone })
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: validation.data.name,
                phone: validation.data.phone || null,
            },
        })

        revalidatePath("/profile")
        return { success: "Profile updated successfully" }
    } catch (error) {
        console.error("Profile update error:", error)
        return { error: "Failed to update profile" }
    }
}

export async function resendVerificationEmail(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { error: "User not found" }

        if (user.emailVerified) {
            return { error: "Email is already verified" }
        }

        // Delete any existing unused tokens for this user
        await prisma.emailVerificationToken.deleteMany({
            where: {
                userId: user.id,
                isUsed: false,
            },
        })

        // Generate a new verification token
        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await prisma.emailVerificationToken.create({
            data: {
                id: await nextId("emailVerificationToken"),
                userId: user.id,
                token,
                expiresAt,
            },
        })

        // Send email with verification link
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

        const verificationUrl = `${baseUrl}/verify-email?token=${token}`

        const emailHtml = emailVerificationTemplate({
            userName: user.name || user.email.split('@')[0],
            verificationUrl
        })

        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email - MailAssert',
            html: emailHtml,
        })

        revalidatePath("/profile")
        return { success: "Verification email sent! Check your inbox." }
    } catch (error) {
        console.error("Resend verification error:", error)
        return { error: "Failed to send verification email" }
    }
}
