import { NextResponse } from 'next/server';
import { checkInbox } from '@/lib/imap';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filterTo = searchParams.get('to') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

        // The checkInbox function currently fetches UNSEEN messages
        // If filterTo is provided, it adds search criteria ['TO', filterTo]
        const result = await checkInbox(filterTo);

        if (result && result.success && result.emails) {
            // Apply limit here for now since checkInbox doesn't support it directly
            const emails = result.emails.slice(0, limit);
            return NextResponse.json({ success: true, emails: emails });
        } else {
            console.error('Check inbox failed:', result?.error);
            return NextResponse.json(
                { success: false, error: 'Failed to retrieve emails' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Inbox Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
