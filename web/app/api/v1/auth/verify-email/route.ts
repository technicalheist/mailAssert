import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
        }

        const verificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!verificationToken) {
            return NextResponse.json({ success: false, error: 'Invalid verification token' }, { status: 400 });
        }

        if (verificationToken.isUsed) {
            return NextResponse.json({ success: false, error: 'Token already used' }, { status: 400 });
        }

        if (verificationToken.expiresAt < new Date()) {
            return NextResponse.json({ success: false, error: 'Token expired' }, { status: 400 });
        }

        // Mark email as verified and token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId },
                data: { emailVerified: new Date() }
            }),
            prisma.emailVerificationToken.update({
                where: { id: verificationToken.id },
                data: { isUsed: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            email: verificationToken.user.email
        });
    } catch (error) {
        console.error('Email Verification Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
