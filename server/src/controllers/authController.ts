import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { createUserToken, setTokenCookie, generateEmailToken, verifyEmailToken, generatePasswordToken, verifyPasswordToken } from '../utils/jwt';
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail } from '../utils/mailer';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, firstName, lastName } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            // If the existing account was created via Google, return a clearer message
            if (existing.authProvider === 'google') {
                return res.status(400).json({ message: 'Email đã được dùng bởi tài khoản Google. Vui lòng đăng nhập bằng Google hoặc sử dụng chức năng "Quên mật khẩu" để thiết lập mật khẩu cho tài khoản này.' });
            }
            return res.status(400).json({ message: 'Email already in use' });
        }

        if (password && password.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }
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

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.json({ success: true }); // do not reveal existence

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'This account uses Google login; password reset not available' });
        }

        const token = generatePasswordToken(String(user._id));
        // Send reset email
        sendResetPasswordEmail(user.email, token, user.firstName || user.username).catch((e: any) => console.error('Reset email failed', e));

        return res.json({ success: true });
    } catch (e) {
        console.error('forgotPassword error', e);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });

        const decoded = verifyPasswordToken(token);
        if (!decoded) return res.status(400).json({ message: 'Invalid or expired token' });

        const userId = decoded.id;
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'This account uses Google login; password reset not available' });
        }

        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();

        return res.json({ success: true, message: 'Password has been reset' });
    } catch (e) {
        console.error('resetPassword error', e);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const userId = req.user && (req.user as any)._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'Google accounts cannot change password here' });
        }

        const match = await bcrypt.compare(currentPassword, user.password || '');
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.json({ success: true, message: 'Password changed' });
    } catch (e) {
        console.error('changePassword error', e);
        return res.status(500).json({ message: 'Server error' });
    }
};
