'use server'

import { sendEmail } from '@/lib/mail'
import { syncEmails } from '@/lib/imap'
// import { revalidatePath } from 'next/cache' // unused
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function sendEmailAction(formData: FormData) {
    const to = formData.get('to') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!to || !subject || !message) {
        return { success: false, error: 'Missing required fields' }
    }

    const result = await sendEmail({ to, subject, text: message })
    return result
}

export async function checkInboxAction(inboxIdOverride?: string, page: number = 0, search?: string) {
    const session = await auth()
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    // Trigger IMAP sync (only on first page load)
    if (page === 0) {
        try {
            await syncEmails();
        } catch (error) {
            console.error("IMAP Sync failed:", error);
        }
    }

    // Get user inboxes
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { inboxes: true }
    })

    if (!user || user.inboxes.length === 0) {
        return { success: false, error: 'No inboxes setup' }
    }

    let targetInbox = user.inboxes.find(i => i.status === 'active'); // Default to active

    // If override provided, find that specific inbox (even if removed)
    if (inboxIdOverride) {
        const found = user.inboxes.find(i => i.inboxId === inboxIdOverride);
        if (found) {
            targetInbox = found;
        } else {
            return { success: false, error: 'Inbox access denied' }
        }
    }

    if (!targetInbox) {
        // Fallback to first inbox if no active one found? or return error
        if (user.inboxes.length > 0) targetInbox = user.inboxes[0];
        else return { success: false, error: 'No active inbox' }
    }

    const LIMIT = 20;

    // Fetch emails from DB
    const emails = await prisma.email.findMany({
        where: {
            inboxId: targetInbox.id,
            deletedAt: null,
            ...(search ? {
                OR: [
                    { fromAddress: { contains: search, mode: 'insensitive' } },
                    { toAddress: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        },
        orderBy: { receivedAt: 'desc' },
        skip: page * LIMIT,
        take: LIMIT
    });

    // Map to the format expected by InboxView
    const mappedEmails = emails.map(e => ({
        id: e.messageId, // or e.id.toString()
        from: e.fromAddress,
        to: e.toAddress,
        subject: e.subject || '(No Subject)',
        date: e.receivedAt,
        body: e.bodyText || e.bodyHtml || '', // Prefer text for preview? InboxView seems to display full body.
        seq: e.imapUid,
        isRead: e.isRead
    }));

    return {
        success: true,
        emails: mappedEmails,
        inboxId: targetInbox.inboxId,
        inboxes: user.inboxes.filter(i => i.status === 'active').map(i => ({
            id: i.inboxId, // Using inboxId string as ID for frontend
            name: i.name || i.inboxId,
            domain: i.mailDomain
        }))
    }
}

export async function markEmailReadAction(emailId: string) {
    const session = await auth()
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const email = await prisma.email.findUnique({
            where: { messageId: emailId },
            include: { inbox: true }
        });

        if (!email) return { success: false, error: 'Not found' };

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user || email.inbox.userId !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.email.update({
            where: { id: email.id },
            data: { isRead: true }
        });

        return { success: true };
    } catch (error) {
        console.error("Mark read error:", error);
        return { success: false, error: 'Failed' };
    }
}

export async function deleteEmailAction(emailId: string) {
    const session = await auth()
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Verify ownership (optional but good)
        // For simplicity, just update if exists. Or verify user.
        // But messageId is unique global? No. unique.

        // Find email and check if it belongs to user's inbox?
        // Optimization: Just update where inbox.userId = user.id
        // But for now, simple findUnique and check.

        // Actually emailId here is messageId (string) or id (Int)?
        // Frontend sends email.id which is mapped from messageId.

        const email = await prisma.email.findUnique({
            where: { messageId: emailId },
            include: { inbox: true }
        });

        if (!email) return { success: false, error: 'Email not found' };

        // Check ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user || email.inbox.userId !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.email.update({
            where: { id: email.id },
            data: { deletedAt: new Date() }
        });

        return { success: true };
    } catch (error) {
        console.error('Delete email error:', error);
        return { success: false, error: 'Failed' };
    }
}


