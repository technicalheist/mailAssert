import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const emailId = parseInt(id);
        if (isNaN(emailId)) {
            return NextResponse.json({ error: "Invalid email ID format" }, { status: 400 });
        }

        const email = await prisma.email.findUnique({
            where: { id: emailId },
            include: { inbox: true }
        });

        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        if (email.inbox.userId !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        if (email.inbox.status !== 'active') {
            return NextResponse.json({ error: "Inbox is not active" }, { status: 403 });
        }

        // Return email, without exposing inbox details unnecessarily
        const { inbox, ...safeEmail } = email;

        return NextResponse.json({ email: safeEmail, inboxId: inbox.inboxId });
    } catch (error) {
        console.error("Error fetching email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
