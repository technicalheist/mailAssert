
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createInboxResources } from "@/lib/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const inboxes = await prisma.inbox.findMany({
            where: {
                userId: parseInt(session.user.id),
                status: 'active'
            },
            include: {
                _count: {
                    select: { emails: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ inboxes });
    } catch (error) {
        console.error("Error fetching inboxes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { inboxId } = await request.json();

        if (!inboxId || typeof inboxId !== 'string') {
            return NextResponse.json({ error: "Invalid inbox ID" }, { status: 400 });
        }

        // Validate inbox ID format (alphanumeric, etc)
        if (!/^[a-z0-9]+$/.test(inboxId)) {
            return NextResponse.json({ error: "Inbox ID must be alphanumeric lowercase" }, { status: 400 });
        }

        // Check if inbox ID already exists globally
        const existingGlobal = await prisma.inbox.findUnique({
            where: { inboxId }
        });

        if (existingGlobal) {
            return NextResponse.json({ error: "Inbox ID already taken" }, { status: 409 });
        }

        // Check if user already has an active inbox?
        // AGENT.md: "One active inbox per user (optional depending on business logic)"
        // Let's enforce it for now to keep it simple, or check if they want to replace it.
        // If they have an active inbox, we might mark it as removed?
        // AGENT.md Section 6.2: "If User Changes Inbox ID... Old inbox -> marked removed. New inbox -> marked active"

        const activeInbox = await prisma.inbox.findFirst({
            where: {
                userId: parseInt(session.user.id),
                status: 'active'
            }
        });

        if (activeInbox) {
            // Mark as removed
            // We should cleanup Cloudflare resources for the old inbox? 
            // AGENT.md Section 7.2: "On Inbox Removal... Remove DNS record... Remove routing rule... Update status to removed"

            // We'll require a separate call or handle it here?
            // "If User Changes Inbox ID" implies this POST creates a NEW one and replaces the old one.

            // Let's handle removal of the old one first.
            // BUT wait, maybe we should do this in a background job or transaction?
            // Cloudflare calls might take time.

            // For now, let's just mark it as removed in DB and we can cleanup resources later?
            // Or we do it synchronously.

            // Actually, let's implement the removal logic.
            // import removeInboxResources is needed.
        }

        // We need to import removeInboxResources
        // For now, let's just proceed with creating the new one.

        // 1. Create Cloudflare Resources
        // We need a destination email for the routing.
        // It should be the email address we are using for IMAP/SMTP in our backend.
        // Which is `process.env.IMAP_USERNAME` (or CLOUDFLARE_EMAIL if it's the destination? No.)
        // The routing rule forwards to an email address.
        // It must be verified in Cloudflare?
        // Yes, destination address must be verified.
        // We assume `process.env.IMAP_USERNAME` is verified in Cloudflare.

        const destinationEmail = process.env.IMAP_USERNAME;
        if (!destinationEmail) {
            return NextResponse.json({ error: "Server configuration error: Missing destination email" }, { status: 500 });
        }

        await createInboxResources(inboxId, destinationEmail);

        // 2. Create DB Record
        const newInbox = await prisma.inbox.create({
            data: {
                userId: parseInt(session.user.id),
                inboxId: inboxId,
                mailDomain: process.env.MAIL_DOMAIN || 'mailassert.com',
                status: 'active'
            }
        });

        // 3. Mark old inbox as removed and cleanup if it existed
        if (activeInbox) {
            // We can't immediately remove resources if it fails, but we try.
            // Also we import removeInboxResources dynamically or at top.
            const { removeInboxResources } = await import("@/lib/cloudflare");
            try {
                await removeInboxResources(activeInbox.inboxId);
            } catch (e) {
                console.error("Failed to remove old inbox resources:", e);
                // We don't fail the request, but log it.
            }

            await prisma.inbox.update({
                where: { id: activeInbox.id },
                data: {
                    status: 'removed',
                    removedAt: new Date()
                }
            });
        }

        return NextResponse.json({ inbox: newInbox });

    } catch (error) {
        console.error("Error creating inbox:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
