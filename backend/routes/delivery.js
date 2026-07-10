const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authMiddleware, roleBasedAuth } = require('../middleware/authMiddleware');

router.post('/:order_id/assign', authMiddleware, roleBasedAuth(['admin']), deliveryController.assignDeliveryPartner);
router.get('/partner/orders', authMiddleware, roleBasedAuth(['delivery_partner']), deliveryController.getDeliveryPartnerOrders);
router.get('/:order_id', authMiddleware, deliveryController.getDelivery);
router.put('/:delivery_id/location', authMiddleware, deliveryController.updateDeliveryLocation);
router.put('/:delivery_id/status', authMiddleware, deliveryController.updateDeliveryStatus);

module.exports = router;