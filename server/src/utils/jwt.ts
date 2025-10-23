import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../models/User';
import { sendWelcomeEmail } from './mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_EXPIRES_IN = '7d'; // Token hết hạn sau 7 ngày

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const setTokenCookie = (res: Response, token: string) => {
    // Đặt cookie với httpOnly để tăng bảo mật
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // domain: optional, set if you use a specific domain
    });
};

export const createUserToken = async (user: any) => {
    // Tạo token với thông tin cần thiết
    const token = generateToken(user._id);
    
    // Nếu đây là lần đăng nhập/đăng ký đầu tiên (không có lastLogin), gửi email chào mừng
    try {
    const dbUser = await User.findById(user._id).select('lastLogin email firstName authProvider isEmailVerified');
        const lastLogin = dbUser ? (dbUser as any).lastLogin : undefined;
        const isFirst = !lastLogin;
        // Only send welcome email automatically if the user's email is already verified
        // (e.g., Google users will have isEmailVerified=true; local users will get welcome after they verify)
        if (dbUser && isFirst && (dbUser as any).isEmailVerified) {
            const email = (dbUser as any).email as string | undefined;
            const firstName = (dbUser as any).firstName as string | undefined;
            if (email) {
                // call but don't await to avoid delaying token issuance
                sendWelcomeEmail(email, firstName).catch((e: any) => console.error('Welcome email failed', e));
            }
        }
    } catch (e) {
        console.error('Error checking lastLogin for welcome email', e);
    }

    // Cập nhật lastLogin trong database
    await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date()
    });

    return token;
};

// Generate a short-lived token for email verification
export const generateEmailToken = (userId: string): string => {
    return jwt.sign({ id: userId, type: 'email_verify' }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyEmailToken = (token: string): any => {
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.type === 'email_verify') return decoded;
        return null;
    } catch (e) {
        return null;
    }
};