import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, text, html } = body;

        if (!to || !subject || !text) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: to, subject, text' },
                { status: 400 }
            );
        }

        const result = await sendEmail({ to, subject, text, html });

        if (result && result.success) {
            return NextResponse.json({ success: true, message: 'Email sent successfully' });
        } else {
            console.error('Send email failed:', result?.error);
            return NextResponse.json(
                { success: false, error: 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Send Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
