import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
                // Update last used timestamp
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
        const inboxes = await prisma.inbox.findMany({
            where: {
                userId: userId,
                status: 'active'
            },
            select: {
                inboxId: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const activeInboxIds = inboxes.map(inbox => inbox.inboxId);
        return NextResponse.json({ inboxIds: activeInboxIds });
    } catch (error) {
        console.error("Error fetching inbox IDs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
