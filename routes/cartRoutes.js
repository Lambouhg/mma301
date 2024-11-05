const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Lấy giỏ hàng của người dùng
router.get('/:userId', cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/:userId', cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/:productId', cartController.removeFromCart);
// Thêm route cho cập nhật số lượng sản phẩm
router.put('/:userId/:productId/update', cartController.updateQuantity);
module.exports = router;
router.delete('/:userId', cartController.deleteCart);