
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';
import { passwordResetTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success even if user not found to prevent enumeration
        if (!user) {
            return NextResponse.json({ success: true, message: 'If the email exists, a reset link will be sent.' });
        }

        // Generate Token
        const tokenLength = 32;
        const resetToken = crypto.randomBytes(tokenLength).toString('hex');

        // Create DB record
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
            },
        });

        // Send Email
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        const emailHtml = passwordResetTemplate({
            userName: user.name || user.email.split('@')[0],
            resetUrl
        });

        await sendEmail({
            to: email,
            subject: 'Reset Your Password - MailAssert',
            html: emailHtml,
        });

        return NextResponse.json({ success: true, message: 'Reset email sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
