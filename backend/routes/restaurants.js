import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, clusterId } = req.query;
    let sql = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    if (category && category !== 'All') { sql += ' AND cuisine = ?'; params.push(category); }
    if (search) { sql += ' AND (name LIKE ? OR cuisine LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (featured === 'true') { sql += ' AND is_featured = TRUE'; }
    if (clusterId) { sql += ' AND cluster_id = ?'; params.push(clusterId); }
    sql += ' ORDER BY rating DESC';
    const [rows] = await pool.query(sql, params);
    const restaurants = rows.map(r => ({
      ...r,
      distance: (Math.random() * 2.5 + 0.5).toFixed(1) + 'km',
    }));
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine');
    res.json(rows.map(r => r.cuisine));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE is_featured = TRUE ORDER BY rating DESC LIMIT 6');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured restaurants' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rRows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (rRows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    const restaurant = rRows[0];
    const [mRows] = await pool.query('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = TRUE ORDER BY category, name', [id]);
    const [revRows] = await pool.query('SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC', [id]);
    const [clusterRows] = await pool.query(
      'SELECT id, name, cuisine, address, lat, lng, rating, review_count, delivery_time, delivery_fee, min_order, is_open, is_featured, image_url, cluster_id FROM restaurants WHERE cluster_id = ? AND id != ? ORDER BY rating DESC',
      [restaurant.cluster_id, id]
    );
    res.json({ ...restaurant, menuItems: mRows, reviews: revRows, clusterRestaurants: clusterRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const { rating, comment, reviewerName } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });
    const auth = req.headers.authorization;
    let userId = 1;
    if (auth) {
      const parts = auth.replace('Bearer ', '').split('-');
      userId = parseInt(parts[parts.length - 2]) || 1;
    }
    const [result] = await pool.query(
      'INSERT INTO reviews (restaurant_id, user_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?, ?)',
      [restaurantId, userId, rating, comment || null, reviewerName || 'Anonymous']
    );
    const [newRating] = await pool.query('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE restaurant_id = ?', [restaurantId]);
    await pool.query('UPDATE restaurants SET rating = ?, review_count = ? WHERE id = ?',
      [parseFloat(newRating[0].avg).toFixed(1), newRating[0].cnt, restaurantId]);
    res.status(201).json({ id: result.insertId, rating, comment, reviewerName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

export default router;
