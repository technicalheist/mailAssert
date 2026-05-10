import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    let userId: number | null = null;

    // First try session auth (for browser usage)
    const session = await auth();
    if (session && session.user && session.user.id) {
        userId = parseInt(session.user.id);
    } else {
        // Then try API Key auth (for programmatic usage)
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKey = authHeader.substring(7);
            const validKey = await prisma.apiKey.findUnique({
                where: { key: apiKey }
            });
            if (validKey) {
                userId = validKey.userId;
            }
        }
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bodyParse = await request.json().catch(() => ({}));
        const q = bodyParse.q || '';
        const subject = bodyParse.subject || q;
        const from = bodyParse.from || q;
        const to = bodyParse.to || q;
        const bodyContent = bodyParse.body || q;
        const inboxId = bodyParse.inboxId;

        if (!subject && !from && !to && !bodyContent && !inboxId && !q) {
            return NextResponse.json({ error: "Search parameters required" }, { status: 400 });
        }

        const activeInboxes = await prisma.inbox.findMany({
            where: {
                userId: userId,
                status: 'active',
                ...(inboxId ? { inboxId: inboxId } : {})
            },
            select: { id: true }
        });

        const activeInboxIds = activeInboxes.map(i => i.id);

        if (activeInboxIds.length === 0) {
            return NextResponse.json({ emails: [] });
        }

        let orConditions: any[] = [];
        if (subject) {
            orConditions.push({ subject: { contains: subject, mode: 'insensitive' } });
        }
        if (from) {
            orConditions.push({ fromAddress: { contains: from, mode: 'insensitive' } });
        }
        if (to) {
            orConditions.push({ toAddress: { contains: to, mode: 'insensitive' } });
        }
        if (bodyContent) {
            orConditions.push({ bodyText: { contains: bodyContent, mode: 'insensitive' } });
            orConditions.push({ bodyHtml: { contains: bodyContent, mode: 'insensitive' } });
        }

        const emails = await prisma.email.findMany({
            where: {
                inboxId: { in: activeInboxIds },
                ...(orConditions.length > 0 ? { OR: orConditions } : {})
            },
            orderBy: { receivedAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Error searching emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
