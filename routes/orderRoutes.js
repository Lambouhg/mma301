const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create a new order
router.post('/', orderController.createOrder);

// Get order details by ID
router.get('/:orderId', orderController.getOrderById);

// Get orders by user ID
router.get('/user/:userId', orderController.getOrdersByUserId);

module.exports = router;
