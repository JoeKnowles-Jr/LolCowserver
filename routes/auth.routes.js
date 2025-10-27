const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Sequelize User model
const router = express.Router();

// Secret key for JWT (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
    res.status(201).json({ message: 'User registered successfully', user });
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.userId, username: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
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