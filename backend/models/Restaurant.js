const db = require('../config/database');

class Restaurant {
  static async create(data) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO restaurants (owner_id, name, description, latitude, longitude, address, phone, email, delivery_radius, image, opening_time, closing_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [data.owner_id, data.name, data.description || null, data.latitude, data.longitude, data.address, data.phone || null, data.email || null, data.delivery_radius || 3, data.image || null, data.opening_time || null, data.closing_time || null], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM restaurants WHERE id = ? AND is_active = true', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async findNearby(latitude, longitude, radius = 3) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM restaurants WHERE is_active = true HAVING distance <= ? ORDER BY distance ASC';
      db.query(query, [latitude, longitude, latitude, radius], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getAll(limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM restaurants WHERE is_active = true LIMIT ? OFFSET ?', [limit, offset], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, data) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE restaurants SET ';
      const values = [];
      Object.keys(data).forEach((key, index) => {
        query += `\${ key} = ?`;
        values.push(data[key]);
        if (index < Object.keys(data).length - 1) query += ', ';
      });
      query += ' WHERE id = ?';
      values.push(id);
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getStats(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(DISTINCT o.id) as total_orders, SUM(o.total_amount) as total_revenue FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE oi.restaurant_id = ? AND o.status = "delivered"';
      db.query(query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }
}

module.exports = Restaurant;