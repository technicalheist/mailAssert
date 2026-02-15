'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
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
                userId: user.id,
                token,
                expiresAt,
            },
        })

        // TODO: Send email with verification link
        // For now, we'll just log it
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
        console.log("Verification URL:", verificationUrl)

        revalidatePath("/profile")
        return { success: "Verification email sent! Check your inbox." }
    } catch (error) {
        console.error("Resend verification error:", error)
        return { error: "Failed to send verification email" }
    }
}
