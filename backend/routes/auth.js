import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { getUserId, makeToken } from '../authToken.js';

const router = Router();

async function getAddresses(userId) {
  const [rows] = await pool.query(
    'SELECT id, label, address, latitude, longitude, is_default FROM delivery_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [userId]
  );
  return rows;
}

router.post('/register', async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const phone = req.body.phone?.trim();
    const address = req.body.address?.trim();
    if (!name || !email || !password || !phone) return res.status(400).json({ error: 'Name, Gmail address, phone number, and password are required' });
    if (name.length > 255) return res.status(400).json({ error: 'Name must be 255 characters or fewer' });
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) return res.status(400).json({ error: 'Use a Gmail address ending in @gmail.com' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must be 8–72 characters and include uppercase, lowercase, and a number' });
    }
    if (phone && !/^[+\d][\d\s-]{6,19}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid phone number' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, address || null]
    );
    const userId = result.insertId;
    const token = makeToken(userId);
    res.status(201).json({ token, user: { id: userId, name, email, phone, address } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = makeToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/addresses', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    res.json(await getAddresses(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load delivery addresses' });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { label, address, latitude, longitude, isDefault = false } = req.body;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!label?.trim()) {
      return res.status(400).json({ error: 'An address label is required' });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Choose a delivery location on the map' });
    }
    if (isDefault) await pool.query('UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    const [result] = await pool.query(
      'INSERT INTO delivery_addresses (user_id, label, address, latitude, longitude, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, label.trim(), address?.trim() || '', lat, lng, isDefault]
    );
    const [rows] = await pool.query(
      'SELECT id, label, address, latitude, longitude, is_default FROM delivery_addresses WHERE id = ? AND user_id = ?',
      [result.insertId, userId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save delivery address' });
  }
});

router.patch('/addresses/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const addressId = Number(req.params.id);
    const { label, address, latitude, longitude, isDefault } = req.body;
    const [match] = await pool.query('SELECT id FROM delivery_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (!match.length) return res.status(404).json({ error: 'Delivery address not found' });
    if (label != null && !label.trim()) return res.status(400).json({ error: 'Address label is required' });
    if (latitude != null && longitude != null) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ error: 'Choose a delivery location on the map' });
      }
      await pool.query('UPDATE delivery_addresses SET latitude = ?, longitude = ? WHERE id = ? AND user_id = ?', [lat, lng, addressId, userId]);
    }
    if (isDefault) {
      await pool.query('UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }
    await pool.query(
      'UPDATE delivery_addresses SET label = COALESCE(?, label), address = COALESCE(?, address), is_default = COALESCE(?, is_default) WHERE id = ? AND user_id = ?',
      [label != null ? label.trim() : null, address != null ? address.trim() : null, isDefault != null ? isDefault : null, addressId, userId]
    );
    const [rows] = await pool.query('SELECT id, label, address, latitude, longitude, is_default FROM delivery_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update delivery address' });
  }
});

router.patch('/addresses/:id/default', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const addressId = Number(req.params.id);
    const [match] = await pool.query('SELECT id FROM delivery_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (!match.length) return res.status(404).json({ error: 'Delivery address not found' });
    await pool.query('UPDATE delivery_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    await pool.query('UPDATE delivery_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [addressId, userId]);
    res.json(await getAddresses(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set default delivery address' });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [result] = await pool.query('DELETE FROM delivery_addresses WHERE id = ? AND user_id = ?', [Number(req.params.id), userId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Delivery address not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete delivery address' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [rows] = await pool.query('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.patch('/me', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { name, phone, address } = req.body;
    await pool.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
      [name || null, phone || null, address || null, userId]);
    const [rows] = await pool.query('SELECT id, name, email, phone, address FROM users WHERE id = ?', [userId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
