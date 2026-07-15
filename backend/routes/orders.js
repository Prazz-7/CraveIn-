const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/customer/my-orders', authMiddleware, orderController.getCustomerOrders);
router.get('/:order_id', authMiddleware, orderController.getOrderById);
router.put('/:order_id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:order_id/cancel', authMiddleware, orderController.cancelOrder);
router.get('/restaurant/:restaurant_id/orders', authMiddleware, orderController.getRestaurantOrders);

module.exports = router;