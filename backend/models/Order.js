const db = require('../config/database');

class Order {
  static async create(data) {
    return new Promise((resolve, reject) => {
      const orderNumber = `ORD-${Date.now()}`;
      const query = 'INSERT INTO orders (customer_id, order_number, total_amount, delivery_charge, discount, status, payment_method, delivery_address, customer_latitude, customer_longitude, special_instructions, estimated_delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [data.customer_id, orderNumber, data.total_amount, data.delivery_charge || 0, data.discount || 0, 'pending', data.payment_method || 'card', data.delivery_address, data.customer_latitude || null, data.customer_longitude || null, data.special_instructions || null, data.estimated_delivery_time || 30], (err, result) => {
        if (err) reject(err);
        else resolve({ id: result.insertId, order_number: orderNumber });
      });
    });
  }

  static async addOrderItem(orderId, data) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO order_items (order_id, menu_item_id, restaurant_id, quantity, price, item_total, special_notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [orderId, data.menu_item_id, data.restaurant_id, data.quantity, data.price, data.quantity * data.price, data.special_notes || null], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findById(orderId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT o.*, u.name as customer_name, u.phone as customer_phone FROM orders o LEFT JOIN users u ON o.customer_id = u.id WHERE o.id = ?';
      db.query(query, [orderId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async getOrderItems(orderId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT oi.*, m.name as item_name, m.image, r.name as restaurant_name FROM order_items oi JOIN menu_items m ON oi.menu_item_id = m.id JOIN restaurants r ON oi.restaurant_id = r.id WHERE oi.order_id = ?';
      db.query(query, [orderId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findByCustomerId(customerId, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [customerId, limit, offset], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async updateStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async assignDeliveryPartner(orderId, deliveryPartnerId) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE orders SET delivery_partner_id = ?, status = ? WHERE id = ?', [deliveryPartnerId, 'confirmed', orderId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getPendingOrders(restaurantId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT DISTINCT o.* FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE oi.restaurant_id = ? AND o.status IN ("pending", "confirmed", "preparing") ORDER BY o.created_at ASC';
      db.query(query, [restaurantId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Order;