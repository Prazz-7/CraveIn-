const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authMiddleware, roleBasedAuth } = require('../middleware/authMiddleware');

router.get('/nearby', restaurantController.getNearbyRestaurants);
router.get('/all', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', authMiddleware, roleBasedAuth(['restaurant_owner', 'admin']), restaurantController.createRestaurant);
router.put('/:id', authMiddleware, restaurantController.updateRestaurant);
router.delete('/:id', authMiddleware, restaurantController.deleteRestaurant);
router.get('/:id/stats', authMiddleware, restaurantController.getRestaurantStats);

module.exports = router;