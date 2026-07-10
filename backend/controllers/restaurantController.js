const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, latitude, longitude, address, phone, email, opening_time, closing_time } = req.body;
    if (!name || !latitude || !longitude || !address) {
      return res.status(400).json({ success: false, message: 'Name, location, and address are required' });
    }
    const result = await Restaurant.create({ owner_id: req.user.id, name, description, latitude, longitude, address, phone, email, opening_time, closing_time });
    res.status(201).json({ success: true, message: 'Restaurant created', restaurant_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating restaurant', error: err.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    const menu = await MenuItem.findByRestaurantId(req.params.id);
    const stats = await Restaurant.getStats(req.params.id);
    res.json({ success: true, restaurant: { ...restaurant, menu, stats } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching restaurant', error: err.message });
  }
};

exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, radius = 3 } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }
    const restaurants = await Restaurant.findNearby(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching restaurants', error: err.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const restaurants = await Restaurant.getAll(parseInt(limit), parseInt(offset));
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching restaurants', error: err.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Restaurant.update(req.params.id, req.body);
    res.json({ success: true, message: 'Restaurant updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating restaurant', error: err.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Restaurant.update(req.params.id, { is_active: false });
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting restaurant', error: err.message });
  }
};

exports.getRestaurantStats = async (req, res) => {
  try {
    const stats = await Restaurant.getStats(req.params.id);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: err.message });
  }
};