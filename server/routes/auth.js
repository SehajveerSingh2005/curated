const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists by email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check if user already exists by username
    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(val => val.message).join(', ') });
    }
    if (err.code === 11000) {
      const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
      return res.status(400).json({ message: `${capitalizedField} already exists` });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(val => val.message).join(', ') });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
