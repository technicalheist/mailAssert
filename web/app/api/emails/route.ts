import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    let userId: number | null = null;
    const session = await auth();
    if (session && session.user && session.user.id) {
        userId = parseInt(session.user.id);
    } else {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKey = authHeader.substring(7);
            const validKey = await prisma.apiKey.findUnique({
                where: { key: apiKey }
            });
            if (validKey) {
                userId = validKey.userId;
                await prisma.apiKey.update({
                    where: { id: validKey.id },
                    data: { lastUsed: new Date() }
                });
            }
        }
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const activeInboxes = await prisma.inbox.findMany({
            where: {
                userId: userId,
                status: 'active'
            },
            select: { id: true }
        });

        const activeInboxIds = activeInboxes.map(i => i.id);

        if (activeInboxIds.length === 0) {
            return NextResponse.json({ emails: [] });
        }

        const emails = await prisma.email.findMany({
            where: {
                inboxId: { in: activeInboxIds }
            },
            orderBy: { receivedAt: 'desc' },
            take: 100
        });

        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Error fetching all emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
