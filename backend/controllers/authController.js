const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, latitude, longitude, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const result = await User.create({ name, email, phone, password, latitude, longitude, role: role || 'customer' });
    const token = jwt.sign({ id: result.insertId, email, role: role || 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: result.insertId, name, email, role: role || 'customer' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const passwordMatch = await User.verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
};

exports.verifyToken = (req, res) => {
  res.json({ success: true, user: req.user });
};