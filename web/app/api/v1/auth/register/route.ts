
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nextId } from "@/lib/ids";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';
import { emailVerificationTemplate } from '@/lib/email-templates';

export async function POST(request: Request) {
    try {
        const { name, email, phone, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                id: await nextId("user"),
                name: name || null,
                email,
                phone: phone || null,
                password: hashedPassword,
            },
        });

        // Generate a random inbox prefix
        const inboxId = crypto.randomBytes(4).toString('hex');

        await prisma.inbox.create({
            data: {
                id: await nextId("inbox"),
                userId: newUser.id,
                inboxId,
                name: "Main Inbox",
            },
        });

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.emailVerificationToken.create({
            data: {
                id: await nextId("emailVerificationToken"),
                userId: newUser.id,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
            },
        });

        // Send verification email
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        const emailHtml = emailVerificationTemplate({
            userName: name || email.split('@')[0],
            verificationUrl
        });

        await sendEmail({
            to: email,
            subject: 'Verify Your Email - MailAssert',
            html: emailHtml,
        });

        return NextResponse.json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            userId: newUser.id
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
