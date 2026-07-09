const db = require('../config/database');

class Delivery {
  static async create(data) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO deliveries (order_id, delivery_partner_id, pickup_location, delivery_location, status, estimated_time) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [data.order_id, data.delivery_partner_id, data.pickup_location || null, data.delivery_location || null, 'assigned', data.estimated_time || 30], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findByOrderId(orderId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT d.*, u.name as delivery_partner_name, u.phone as delivery_partner_phone FROM deliveries d JOIN users u ON d.delivery_partner_id = u.id WHERE d.order_id = ?';
      db.query(query, [orderId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async updateLocation(deliveryId, latitude, longitude) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE deliveries SET current_latitude = ?, current_longitude = ? WHERE id = ?', [latitude, longitude, deliveryId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async updateStatus(deliveryId, status) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE deliveries SET status = ? WHERE id = ?', [status, deliveryId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getDeliveryPartnerOrders(deliveryPartnerId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT d.*, o.order_number, o.total_amount, o.delivery_address FROM deliveries d JOIN orders o ON d.order_id = o.id WHERE d.delivery_partner_id = ? AND d.status != "delivered" ORDER BY d.created_at DESC';
      db.query(query, [deliveryPartnerId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Delivery;