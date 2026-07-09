const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

exports.addMenuItem = async (req, res) => {
  try {
    const { restaurant_id, name, description, price, category, is_vegetarian } = req.body;
    if (!restaurant_id || !name || !price) {
      return res.status(400).json({ success: false, message: 'Restaurant ID, name, and price required' });
    }
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const result = await MenuItem.create({ restaurant_id, name, description, price, category, is_vegetarian });
    res.status(201).json({ success: true, message: 'Menu item added', item_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding menu item', error: err.message });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const menu = await MenuItem.findByRestaurantId(req.params.restaurant_id);
    const categories = await MenuItem.getCategories(req.params.restaurant_id);
    res.json({ success: true, categories, menu });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching menu', error: err.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.item_id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    const restaurant = await Restaurant.findById(item.restaurant_id);
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await MenuItem.update(req.params.item_id, req.body);
    res.json({ success: true, message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating menu item', error: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.item_id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    const restaurant = await Restaurant.findById(item.restaurant_id);
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await MenuItem.delete(req.params.item_id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting menu item', error: err.message });
  }
};

exports.searchMenuItems = async (req, res) => {
  try {
    const { query, restaurant_id } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    const results = await MenuItem.search(query, restaurant_id || null);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error searching', error: err.message });
  }
};