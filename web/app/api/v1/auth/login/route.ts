
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Missing email or password' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT Access Token
        // This token is for API access based on the user request.
        // It's separate from NextAuth session but allows API testing.
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            SECRET,
            { expiresIn: '1h' }
        );

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
