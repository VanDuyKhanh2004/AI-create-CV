import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { createUserToken, setTokenCookie, generateEmailToken, verifyEmailToken } from '../utils/jwt';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/mailer';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, firstName, lastName } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hashed = password ? await bcrypt.hash(password, 10) : undefined;

        const user = await User.create({
            email,
            username: username || email.split('@')[0],
            password: hashed,
            firstName,
            lastName,
            authProvider: 'local'
        });

        const token = await createUserToken(user);
        setTokenCookie(res, token);

        // send verification email (non-blocking)
        try {
            const vToken = generateEmailToken(String(user._id));
            sendVerificationEmail(user.email, vToken, user.firstName || user.username).catch((e: any) => console.error('Verification email failed', e));
        } catch (e) {
            console.error('Error generating verification token', e);
        }

        res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'Use Google login' });
        }

        const match = await bcrypt.compare(password, user.password || '');
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });

        const token = await createUserToken(user);
        setTokenCookie(res, token);

        res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const me = async (req: any, res: Response) => {
    if (!req.user) return res.json({ isAuthenticated: false, user: null });
    const u = await User.findById(req.user._id).select('-password');
    res.json({ isAuthenticated: true, user: u });
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') return res.status(400).json({ message: 'Invalid token' });

        const decoded = verifyEmailToken(token);
        if (!decoded) return res.status(400).json({ message: 'Invalid or expired token' });

        const userId = decoded.id;
        const u = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });

        // send welcome email after verification (non-blocking)
        try {
            if (u && u.email) {
                sendWelcomeEmail(u.email, u.firstName || u.username).catch((e: any) => console.error('Welcome email failed', e));
            }
        } catch (e) {
            console.error('Error sending welcome email after verify', e);
        }

        return res.json({ success: true, message: 'Email verified' });
    } catch (e) {
        console.error('verifyEmail error', e);
        return res.status(500).json({ message: 'Server error' });
    }
};
