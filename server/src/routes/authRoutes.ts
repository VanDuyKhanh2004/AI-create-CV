import express from 'express';
import passport from 'passport';
import { createUserToken, setTokenCookie } from '../utils/jwt';
import { register, login, me } from '../controllers/authController';

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Local auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', me);

// Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login` }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${CLIENT_URL}/login`);
            }

            // If the user came from Google ensure their email is marked verified
            try {
                if ((req.user as any).authProvider === 'google') {
                    const u = await (await import('../models/User')).default.findById((req.user as any)._id || (req.user as any).id);
                    if (u && !u.isEmailVerified) {
                        u.isEmailVerified = true;
                        await u.save();
                    }
                }
            } catch (err) {
                console.error('Failed to mark Google user as verified:', err);
            }

            const token = await createUserToken(req.user);
            setTokenCookie(res, token);

            return res.redirect(`${CLIENT_URL}/`); // redirect to homepage
        } catch (error) {
            console.error('Auth callback error:', error);
            return res.redirect(`${CLIENT_URL}/login`);
        }
    }
);

// Status / logout
router.get('/status', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
    // Delegate to controller
    const { verifyEmail } = await import('../controllers/authController');
    return verifyEmail(req, res as any);
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.clearCookie('token');
        res.redirect(CLIENT_URL);
    });
});

export default router;