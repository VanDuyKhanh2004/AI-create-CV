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

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.clearCookie('token');
        res.redirect(CLIENT_URL);
    });
});

export default router;