import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { createUserToken, setTokenCookie } from '../utils/jwt';

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
