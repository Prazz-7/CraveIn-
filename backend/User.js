const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const query = 'INSERT INTO users (name, email, phone, password, address, role, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [userData.name, userData.email, userData.phone || null, hashedPassword, userData.address || null, userData.role || 'customer', userData.latitude || null, userData.longitude || null], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async updateLocation(userId, latitude, longitude) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE users SET latitude = ?, longitude = ? WHERE id = ?', [latitude, longitude, userId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async updateProfile(userId, userData) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?';
      db.query(query, [userData.name, userData.phone, userData.address, userId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;