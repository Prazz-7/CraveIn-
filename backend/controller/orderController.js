const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Delivery = require('../models/Delivery');
const { calculateDeliveryCharge, calculateEstimatedDeliveryTime } = require('../utils/locationUtils');

exports.createOrder = async (req, res) => {
  try {
    const { items, delivery_address, customer_latitude, customer_longitude, special_instructions, payment_method } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }
    if (!delivery_address) {
      return res.status(400).json({ success: false, message: 'Delivery address required' });
    }
    let totalAmount = 0;
    const restaurants = new Set();
    const menuItems = {};
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item ${item.menu_item_id} not found` });
      }
      menuItems[item.menu_item_id] = menuItem;
      restaurants.add(menuItem.restaurant_id);
      totalAmount += menuItem.price * item.quantity;
    }
    const deliveryCharge = calculateDeliveryCharge(1.5);
    const estimatedDeliveryTime = calculateEstimatedDeliveryTime(1.5);
    const finalTotal = totalAmount + deliveryCharge;
    const orderResult = await Order.create({ customer_id: req.user.id, total_amount: finalTotal, delivery_charge: deliveryCharge, payment_method, delivery_address, customer_latitude, customer_longitude, special_instructions, estimated_delivery_time: estimatedDeliveryTime });
    for (const item of items) {
      const menuItem = menuItems[item.menu_item_id];
      await Order.addOrderItem(orderResult.id, { menu_item_id: item.menu_item_id, restaurant_id: menuItem.restaurant_id, quantity: item.quantity, price: menuItem.price, special_notes: item.special_notes });
    }
    res.status(201).json({ success: true, message: 'Order created', order: { id: orderResult.id, order_number: orderResult.order_number, total_amount: finalTotal, delivery_charge: deliveryCharge, estimated_delivery_time: estimatedDeliveryTime, restaurants: Array.from(restaurants) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating order', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const orderItems = await Order.getOrderItems(req.params.order_id);
    const delivery = await Delivery.findByOrderId(req.params.order_id);
    res.json({ success: true, order: { ...order, items: orderItems, delivery } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching order', error: err.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const orders = await Order.findByCustomerId(req.user.id, parseInt(limit), parseInt(offset));
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    await Order.updateStatus(req.params.order_id, status);
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating status', error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel ${order.status} order` });
    }
    await Order.updateStatus(req.params.order_id, 'cancelled');
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cancelling order', error: err.message });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.getPendingOrders(req.params.restaurant_id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};