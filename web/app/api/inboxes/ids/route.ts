import { auth } from "@/auth";
import prisma from "@/lib/prisma";
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
