import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ inboxId: string }> }
) {
    const { inboxId } = await params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const inbox = await prisma.inbox.findUnique({
            where: { inboxId }
        });

        if (!inbox || inbox.userId !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Inbox not found or access denied" }, { status: 404 });
        }

        if (inbox.status !== 'active') {
            return NextResponse.json({ error: "Inbox is not active" }, { status: 403 });
        }

        const emails = await prisma.email.findMany({
            where: {
                inboxId: inbox.id
            },
            orderBy: { receivedAt: 'desc' },
            take: 100 // default limit
        });

        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Error fetching emails for inbox:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
