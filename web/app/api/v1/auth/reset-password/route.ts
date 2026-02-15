
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ success: false, error: 'Token and new password are required' }, { status: 400 });
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!resetToken) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
        }

        if (resetToken.isUsed) {
            return NextResponse.json({ success: false, error: 'Token already used' }, { status: 400 });
        }

        if (resetToken.expiresAt < new Date()) {
            return NextResponse.json({ success: false, error: 'Token expired' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User Password and invalidate token
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { isUsed: true }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
