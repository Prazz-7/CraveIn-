const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware, roleBasedAuth } = require('../middleware/authMiddleware');

router.get('/search', menuController.searchMenuItems);
router.get('/:restaurant_id', menuController.getMenuByRestaurant);
router.post('/', authMiddleware, roleBasedAuth(['restaurant_owner', 'admin']), menuController.addMenuItem);
router.put('/:item_id', authMiddleware, menuController.updateMenuItem);
router.delete('/:item_id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;