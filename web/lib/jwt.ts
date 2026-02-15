
import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET;

if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables.');
}

export function signToken(payload: object) {
    return jwt.sign(payload, SECRET!, { expiresIn: '1h' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET!);
    } catch (error) {
        return null;
    }
}
