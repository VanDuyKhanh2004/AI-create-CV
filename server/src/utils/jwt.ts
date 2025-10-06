import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../models/User';

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
    
    // Cập nhật lastLogin trong database
    await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date()
    });

    return token;
};