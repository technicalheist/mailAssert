
import { syncEmails } from "@/lib/imap";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Optional: Add authorization header check (e.g. Bearer token)
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse("Unauthorized", { status: 401 });
    // }

    try {
        await syncEmails();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cron sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
