import { Router } from 'express';
import pool from '../db.js';
import { getUserId } from '../authToken.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const result = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.query(`
        SELECT oi.*, r.name AS restaurant_name
        FROM order_items oi
        JOIN restaurants r ON oi.restaurant_id = r.id
        WHERE oi.order_id = ?`, [order.id]);
      const restaurantIds = [...new Set(items.map(i => i.restaurant_id))];
      const restaurants = restaurantIds.map(rid => ({
        id: rid,
        name: items.find(i => i.restaurant_id === rid)?.restaurant_name || `Restaurant ${rid}`,
        subtotal: items.filter(i => i.restaurant_id === rid).reduce((s, i) => s + i.price * i.quantity, 0),
      }));
      return { ...order, items, restaurants };
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { deliveryAddress, deliveryLatitude, deliveryLongitude, paymentMethod, items } = req.body;
    const latitude = Number(deliveryLatitude);
    const longitude = Number(deliveryLongitude);
    const hasMapLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    if (!hasMapLocation || !paymentMethod || !items?.length) {
      return res.status(400).json({ error: 'A map delivery location, payment method, and items are required' });
    }
    const addressForOrder = deliveryAddress?.trim() || `Map location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    const menuItemIds = items.map(i => i.menuItemId);
    const [menuItems] = await pool.query(
      `SELECT mi.*, r.name AS restaurant_name, r.cluster_id FROM menu_items mi JOIN restaurants r ON mi.restaurant_id = r.id WHERE mi.id IN (?)`,
      [menuItemIds]
    );
    const clusterIds = [...new Set(menuItems.map(m => m.cluster_id))];
    const restaurantIds = [...new Set(menuItems.map(m => m.restaurant_id))];
    if (clusterIds.length > 1) {
      return res.status(400).json({ error: 'Some restaurants in your order are too far apart to be delivered together. Please order from one area or split into separate orders.' });
    }
    if (restaurantIds.length > 3) {
      return res.status(400).json({ error: 'You can only combine up to three restaurants in a single order. Please remove items from extra restaurants to continue.' });
    }
    const DELIVERY_FEE = 80;
    let subtotal = 0;
    for (const item of items) {
      const mi = menuItems.find(m => m.id === item.menuItemId);
      if (mi) subtotal += mi.price * item.quantity;
    }
    const totalAmount = subtotal + DELIVERY_FEE;
    const eta = new Date(Date.now() + 45 * 60 * 1000);
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, status, total_amount, delivery_fee, delivery_address, delivery_lat, delivery_lng, payment_method, estimated_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'placed', totalAmount, DELIVERY_FEE, addressForOrder, latitude, longitude, paymentMethod, eta]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const mi = menuItems.find(m => m.id === item.menuItemId);
      if (!mi) continue;
      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, restaurant_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.menuItemId, mi.restaurant_id, mi.name, mi.price, item.quantity]
      );
    }
    const [newOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await pool.query(`
      SELECT oi.*, r.name AS restaurant_name
      FROM order_items oi JOIN restaurants r ON oi.restaurant_id = r.id
      WHERE oi.order_id = ?`, [orderId]);
    const orderRestaurantIds = [...new Set(orderItems.map(i => i.restaurant_id))];
    const restaurants = orderRestaurantIds.map(rid => ({
      id: rid,
      name: orderItems.find(i => i.restaurant_id === rid)?.restaurant_name || `Restaurant ${rid}`,
      subtotal: orderItems.filter(i => i.restaurant_id === rid).reduce((s, i) => s + i.price * i.quantity, 0),
    }));
    res.status(201).json({ ...newOrder[0], items: orderItems, restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    const [items] = await pool.query(`
      SELECT oi.*, r.name AS restaurant_name
      FROM order_items oi JOIN restaurants r ON oi.restaurant_id = r.id
      WHERE oi.order_id = ?`, [id]);
    const restaurantIds = [...new Set(items.map(i => i.restaurant_id))];
    const restaurants = restaurantIds.map(rid => ({
      id: rid,
      name: items.find(i => i.restaurant_id === rid)?.restaurant_name || `Restaurant ${rid}`,
      subtotal: items.filter(i => i.restaurant_id === rid).reduce((s, i) => s + i.price * i.quantity, 0),
    }));
    res.json({ ...orders[0], items, restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ ...orders[0], items: [], restaurants: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
