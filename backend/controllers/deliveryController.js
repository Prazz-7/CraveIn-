const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { delivery_partner_id } = req.body;
    const order = await Order.findById(req.params.order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    await Order.assignDeliveryPartner(req.params.order_id, delivery_partner_id);
    const deliveryResult = await Delivery.create({ order_id: req.params.order_id, delivery_partner_id, pickup_location: 'Restaurant', delivery_location: order.delivery_address, estimated_time: order.estimated_delivery_time });
    res.json({ success: true, message: 'Delivery partner assigned', delivery_id: deliveryResult.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error assigning partner', error: err.message });
  }
};

exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByOrderId(req.params.order_id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching delivery', error: err.message });
  }
};

exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await Delivery.updateLocation(req.params.delivery_id, latitude, longitude);
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating location', error: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Delivery.updateStatus(req.params.delivery_id, status);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating status', error: err.message });
  }
};

exports.getDeliveryPartnerOrders = async (req, res) => {
  try {
    const orders = await Delivery.getDeliveryPartnerOrders(req.user.id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: err.message });
  }
};

exports.findNearbyDeliveryPartners = async (req, res) => {
  res.json({ success: true, count: 0, partners: [] });
};