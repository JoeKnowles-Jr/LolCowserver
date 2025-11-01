const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models'); // Sequelize User model
const router = express.Router();

// Secret key for JWT (store securely in .env)
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.get('/jwt-test', (req, res) => {
    try {
        const jt = require('jsonwebtoken');
        const token = jt.sign({ test: true }, 'testsecret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'JWT test failed', details: err.message });
    }
});

router.get('/jwt-debug', (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        res.json({
            type: typeof jwt,
            keys: Object.keys(jwt),
            source: jwt,
            signType: typeof jwt.sign
        });
    } catch (err) {
        res.status(500).json({ error: 'JWT debug failed', details: err.message });
    }
});


router.post('/getHash', async (req, res) => {
    const { password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        res.status(201).json({ message: 'Password hashed successfully', hashedPassword });
    } catch (err) {
        res.status(400).json({ error: 'Password hash failed', details: err.message });
    }
});

// POST /register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, pwHash: hashedPassword, needsPwUpdate: false, profileId: null, balance: 100.00 });
        const userObj = user.get({ plain: true });
        delete userObj.pwHash;
        res.status(201).json({ message: 'User registered successfully', user: userObj });
    } catch (err) {
        res.status(400).json({ error: 'Registration failed', details: err.message });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        // return res.json(user.get({ plain: true }));
        const match = await bcrypt.compare(password, user.pwHash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        // return res.json({ id: user.userId, username: user.email})
        let token;
        const userObject = user.get({ plain: true });
        console.log('JWT_SECRET:', JWT_SECRET, typeof JWT_SECRET);
        console.log('userObject:', userObject);

        if (!JWT_SECRET || typeof JWT_SECRET !== 'string') {
            return res.status(500).json({ error: 'JWT secret is invalid' });
        }
        if (!userObject.userId || !userObject.email) {
            return res.status(500).json({ error: 'User object missing required fields' });
        }

        try {
            token = jwt.sign({ id: userObject.userId, username: userObject.email }, JWT_SECRET, { expiresIn: '1h' });
        } catch (jwtErr) {
            console.error('JWT error:', jwtErr);
            return res.status(500).json({ error: 'Token generation failed', details: jwtErr.message });
        }
        delete userObject.pwHash;
        res.json({ message: 'Login successful', token, user: userObject });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

// GET /protected (example)
router.get('/protected', verifyToken, async (req, res) => {
    res.json({ message: `Hello ${req.user.email}, you accessed a protected route!` });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = router;
