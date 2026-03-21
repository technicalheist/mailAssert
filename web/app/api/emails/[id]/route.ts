import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

        if (email.inbox.userId !== userId) {
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    let userId: number | null = null;

    // First try session auth
    const session = await auth();
    if (session && session.user && session.user.id) {
        userId = parseInt(session.user.id);
    } else {
        // Fallback to API Key auth
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
        const emailId = parseInt(id);
        if (isNaN(emailId)) {
            return NextResponse.json({ error: "Invalid email ID format" }, { status: 400 });
        }

        // Find the email and its inbox to verify ownership
        const email = await prisma.email.findUnique({
            where: { id: emailId },
            include: { inbox: true }
        });

        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        // Verify the user owns the inbox that this email is in
        if (email.inbox.userId !== userId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Perform the deletion
        await prisma.email.delete({
            where: { id: emailId }
        });

        return NextResponse.json({ success: true, message: "Email permanently deleted" });
    } catch (error) {
        console.error("Error deleting email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
