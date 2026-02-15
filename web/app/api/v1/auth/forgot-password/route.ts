
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

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
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        const emailContent = `
            Click the link below to reset your password:
            ${resetUrl}

            If you did not request this, please ignore this email.
        `;

        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            text: emailContent,
        });

        return NextResponse.json({ success: true, message: 'Reset email sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
