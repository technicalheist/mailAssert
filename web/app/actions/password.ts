'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcrypt"
import { sendEmail } from "@/lib/email"
import { passwordChangeNotificationTemplate } from "@/lib/email-templates"

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export async function changePassword(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate input
    const validation = passwordSchema.safeParse({
        currentPassword,
        newPassword,
        confirmPassword
    })

    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { error: "User not found" }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return { error: "Current password is incorrect" }
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword) {
            return { error: "New password must be different from current password" }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        })

        // Send notification email if enabled
        if (user.notificationEnabled && user.notifyOnPasswordChange) {
            const emailHtml = passwordChangeNotificationTemplate({
                userName: user.name || user.email.split('@')[0],
                email: user.email,
                changeTime: new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                }),
                ipAddress: undefined // TODO: Get IP from request headers
            })

            await sendEmail({
                to: user.email,
                subject: 'Password Changed - MailAssert',
                html: emailHtml
            })
        }

        revalidatePath("/profile")
        return { success: "Password changed successfully" }
    } catch (error) {
        console.error("Change password error:", error)
        return { error: "Failed to change password" }
    }
}
