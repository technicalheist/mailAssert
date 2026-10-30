'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { nextId } from "@/lib/ids";
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Plan limits
const PLAN_LIMITS = {
    free: { inboxes: 3, name: "Starter (Free)" },
    pro: { inboxes: 5, name: "Pro" },
    enterprise: { inboxes: Infinity, name: "Enterprise" }
} as const

export async function updateNotificationSettings(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const notificationEnabled = formData.get("notificationEnabled") === "on"
    const notifyOnLogin = formData.get("notifyOnLogin") === "on"
    const notifyOnNewEmail = formData.get("notifyOnNewEmail") === "on"
    const notifyOnInboxCreated = formData.get("notifyOnInboxCreated") === "on"
    const notifyOnInboxDeleted = formData.get("notifyOnInboxDeleted") === "on"
    const notifyWeeklySummary = formData.get("notifyWeeklySummary") === "on"
    const notifyOnPasswordChange = formData.get("notifyOnPasswordChange") === "on"
    const notifyOnApiKeyCreated = formData.get("notifyOnApiKeyCreated") === "on"

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                notificationEnabled,
                notifyOnLogin,
                notifyOnNewEmail,
                notifyOnInboxCreated,
                notifyOnInboxDeleted,
                notifyWeeklySummary,
                notifyOnPasswordChange,
                notifyOnApiKeyCreated,
            },
        })
        revalidatePath("/settings")
        return { success: "Notification preferences updated successfully" }
    } catch (error) {
        console.error("Update notification settings error:", error)
        return { error: "Failed to update notification settings" }
    }
}

// Reserved inbox IDs that cannot be used
const RESERVED_INBOX_IDS = [
    // System/Admin
    'admin', 'administrator', 'root', 'system', 'postmaster', 'webmaster',
    // Support/Contact
    'support', 'help', 'contact', 'info', 'hello', 'hi',
    // Security
    'security', 'abuse', 'noreply', 'no-reply', 'donotreply', 'do-not-reply',
    // Sales/Marketing
    'sales', 'marketing', 'billing', 'invoice', 'payment',
    // Common services
    'mail', 'email', 'smtp', 'imap', 'pop', 'pop3',
    // API/Technical
    'api', 'webhook', 'notifications', 'alerts', 'status',
    // Legal/Compliance
    'legal', 'privacy', 'compliance', 'gdpr', 'dmca',
    // Other
    'test', 'demo', 'example', 'sample', 'null', 'undefined',
    'mailassert', 'mail-assert'
]

const inboxIdSchema = z.string()
    .min(6, "Inbox ID must be at least 6 characters")
    .max(30, "Inbox ID must be less than 30 characters")
    .regex(/^[a-z0-9-]+$/, "Inbox ID can only contain lowercase letters, numbers, and hyphens")
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), "Inbox ID cannot start or end with a hyphen")
    .refine((val) => !val.includes('--'), "Inbox ID cannot contain consecutive hyphens")
    .refine((val) => !RESERVED_INBOX_IDS.includes(val), "This Inbox ID is reserved and cannot be used. Please choose a different one.")

export async function createInbox(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const inboxId = (formData.get("inboxId") as string)?.toLowerCase()?.trim()
    const name = formData.get("name") as string

    // Validate inbox ID
    const validation = inboxIdSchema.safeParse(inboxId)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: true }
        })

        if (!user) return { error: "User not found" }

        // Check plan limits (only active inboxes count)
        const activeInboxes = user.inboxes.filter(i => i.status === 'active')
        const planLimit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
        if (activeInboxes.length >= planLimit.inboxes) {
            return {
                error: `You've reached the inbox limit for your ${planLimit.name} plan (${planLimit.inboxes} inbox${planLimit.inboxes > 1 ? 'es' : ''}). Upgrade to add more.`
            }
        }

        // Check if inbox ID is already taken
        const existing = await prisma.inbox.findUnique({
            where: { inboxId: validation.data }
        })

        if (existing) {
            return { error: "This Inbox ID is already taken. Please choose a different one." }
        }

        // Create inbox
        await prisma.inbox.create({
            data: {
                id: await nextId("inbox"),
                userId: user.id,
                inboxId: validation.data,
                name: name || `Inbox ${user.inboxes.length + 1}`
            }
        })

        revalidatePath("/settings")
        return { success: `Inbox created successfully! Your new address: *@${validation.data}.mailassert.com` }
    } catch (error) {
        console.error("Create inbox error:", error)
        return { error: "Failed to create inbox" }
    }
}

export async function updateInbox(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const inboxDbId = parseInt(formData.get("inboxDbId") as string)
    const inboxId = (formData.get("inboxId") as string)?.toLowerCase()?.trim()
    const name = formData.get("name") as string

    // Validate inbox ID
    const validation = inboxIdSchema.safeParse(inboxId)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: true }
        })

        if (!user) return { error: "User not found" }

        // Check if inbox belongs to user
        const inbox = user.inboxes.find(i => i.id === inboxDbId)
        if (!inbox) {
            return { error: "Inbox not found" }
        }

        // Check if new inbox ID is already taken (by someone else)
        const existing = await prisma.inbox.findUnique({
            where: { inboxId: validation.data }
        })

        if (existing && existing.id !== inboxDbId) {
            return { error: "This Inbox ID is already taken. Please choose a different one." }
        }

        // Update inbox
        await prisma.inbox.update({
            where: { id: inboxDbId },
            data: {
                inboxId: validation.data,
                name: name || inbox.name
            }
        })

        revalidatePath("/settings")
        return { success: `Inbox updated successfully! New address: *@${validation.data}.mailassert.com` }
    } catch (error) {
        console.error("Update inbox error:", error)
        return { error: "Failed to update inbox" }
    }
}

export async function deleteInbox(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    const inboxDbId = parseInt(formData.get("inboxDbId") as string)

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: true }
        })

        if (!user) return { error: "User not found" }

        // Check if inbox belongs to user
        const inbox = user.inboxes.find(i => i.id === inboxDbId)
        if (!inbox) {
            return { error: "Inbox not found" }
        }

        // Prevent deleting the last inbox
        if (user.inboxes.length === 1) {
            return { error: "Cannot delete your last inbox. Create a new one first." }
        }

        // Soft delete inbox
        await prisma.inbox.update({
            where: { id: inboxDbId },
            data: {
                status: 'removed',
                removedAt: new Date()
            }
        })

        revalidatePath("/settings")
        return { success: "Inbox deleted successfully" }
    } catch (error) {
        console.error("Delete inbox error:", error)
        return { error: "Failed to delete inbox" }
    }
}

