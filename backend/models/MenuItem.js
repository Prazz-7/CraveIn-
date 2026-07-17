const db = require('../config/database');

class MenuItem {
  static async create(data) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO menu_items (restaurant_id, name, description, price, image, category, is_vegetarian) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [data.restaurant_id, data.name, data.description || null, data.price, data.image || null, data.category || null, data.is_vegetarian || false], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM menu_items WHERE id = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async findByRestaurantId(restaurantId) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = true ORDER BY category', [restaurantId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getCategories(restaurantId) {
    return new Promise((resolve, reject) => {
      db.query('SELECT DISTINCT category FROM menu_items WHERE restaurant_id = ? AND category IS NOT NULL', [restaurantId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async update(id, data) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE menu_items SET ';
      const values = [];
      Object.keys(data).forEach((key, index) => {
       query += `${key} = ?`;
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

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE menu_items SET is_available = false WHERE id = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async search(query, restaurantId = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM menu_items WHERE (name LIKE ? OR description LIKE ?) AND is_available = true';
      const params = [`%${query}%`, `%${query}%`];
      if (restaurantId) {
        sql += ' AND restaurant_id = ?';
        params.push(restaurantId);
      }
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = MenuItem;