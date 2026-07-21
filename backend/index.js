import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auto-progress order statuses every 30 seconds
const STATUS_PIPELINE = ['placed', 'confirmed', 'preparing', 'out for delivery', 'delivered'];
setInterval(async () => {
  try {
    const [orders] = await pool.query(
      'SELECT id, status, updated_at FROM orders WHERE status NOT IN (?, ?)',
      ['delivered', 'cancelled']
    );
    for (const order of orders) {
      const ageMs = Date.now() - new Date(order.updated_at).getTime();
      if (ageMs < 30000) continue;
      const idx = STATUS_PIPELINE.indexOf(order.status);
      if (idx === -1 || idx >= STATUS_PIPELINE.length - 1) continue;
      const next = STATUS_PIPELINE[idx + 1];
      await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [next, order.id]);
      console.log(`Order #${order.id}: ${order.status} → ${next}`);
    }
  } catch (err) {
    console.error('Order progressor error:', err.message);
  }
}, 30000);

app.listen(PORT, () => {
  console.log(`CraveIn API running on http://localhost:${PORT}`);
});
