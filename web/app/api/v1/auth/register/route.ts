
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mail';

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
                userId: newUser.id,
                inboxId,
                name: "Main Inbox",
            },
        });

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.emailVerificationToken.create({
            data: {
                userId: newUser.id,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours
            },
        });

        // Send verification email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to MailAssert!</h2>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for registering with MailAssert. Please verify your email address to activate your account.</p>
                <p style="margin: 30px 0;">
                    <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Verify Email Address
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'Verify Your Email - MailAssert',
            html: emailContent,
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
