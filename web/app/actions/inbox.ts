'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createInboxResources, removeInboxResources } from "@/lib/cloudflare";
import { revalidatePath } from "next/cache";

export async function createInbox(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const name = formData.get("name") as string || "New Inbox";
    const inboxId = formData.get("inboxId") as string;

    if (!inboxId || inboxId.length < 3) {
        return { error: "Inbox ID must be at least 3 characters long" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: { where: { status: 'active' } } }
        });

        if (!user) return { error: "User not found" };

        // Check limit (1 for Free Tier)
        if (user.inboxes.length >= 5) {
            return { error: "Free plan limit reached (5 Active Inboxes max). Please delete an existing inbox first." };
        }

        // Check if ID is taken globally
        const existing = await prisma.inbox.findUnique({
            where: { inboxId }
        });

        if (existing) {
            return { error: "This Inbox ID is already taken" };
        }

        // 1. Create Cloudflare Resources
        const destinationEmail = process.env.IMAP_USERNAME;
        if (!destinationEmail) {
            return { error: "Server configuration error: Missing destination email" };
        }

        try {
            await createInboxResources(inboxId, destinationEmail);
        } catch (e: any) {
            return { error: `Failed to provision inbox resources: ${e.message}` };
        }

        // 2. Create DB Record
        await prisma.inbox.create({
            data: {
                userId: user.id,
                name,
                inboxId,
                status: 'active',
                mailDomain: process.env.MAIL_DOMAIN || 'mailassert.com'
            }
        });

        revalidatePath("/inboxes");
        return { success: "Inbox created successfully" };
    } catch (error) {
        console.error("Create Inbox Error:", error);
        return { error: "Failed to create inbox" };
    }
}

export async function deleteInbox(idRaw: string | number) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const id = Number(idRaw);
    if (isNaN(id)) return { error: "Invalid ID" };

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: true }
        });

        const inbox = user?.inboxes.find(i => i.id === id);
        if (!inbox) return { error: "Inbox not found or access denied" };

        // 1. Remove Cloudflare Resources
        try {
            await removeInboxResources(inbox.inboxId);
        } catch (e) {
            console.error("Failed to remove Cloudflare resources:", e);
            // Continue to mark as removed in DB anyway?
        }

        // 2. Soft Delete in DB
        await prisma.inbox.update({
            where: { id: id },
            data: {
                status: 'removed',
                removedAt: new Date()
            }
        });

        revalidatePath("/inboxes");
        return { success: "Inbox deleted" };
    } catch (error) {
        console.error("Delete Inbox Error:", error);
        return { error: "Failed to delete inbox" };
    }
}

export async function updateInbox(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const id = Number(formData.get("id"));
    const name = formData.get("name") as string;
    const inboxId = formData.get("inboxId") as string; // Optional update of ID

    if (!id || isNaN(id)) return { error: "Invalid ID" };

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { inboxes: true }
        });

        const existing = user?.inboxes.find(i => i.id === id);
        if (!existing) return { error: "Inbox not found" };

        // If changing inboxId, check uniqueness
        if (inboxId && inboxId !== existing.inboxId) {
            const taken = await prisma.inbox.findUnique({ where: { inboxId } });
            if (taken) return { error: "Inbox ID taken" };
        }

        await prisma.inbox.update({
            where: { id },
            data: {
                name: name || existing.name,
                inboxId: inboxId || existing.inboxId
            }
        });

        revalidatePath("/inboxes");
        return { success: "Inbox updated" };
    } catch (error) {
        return { error: "Failed to update inbox" };
    }
}
