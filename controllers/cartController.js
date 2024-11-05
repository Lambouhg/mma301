const Cart = require('../models/Cart');

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        // Nếu giỏ hàng chưa tồn tại, tạo mới
        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity }] });
        } else {
            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.products = cart.products.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};


// Xóa giỏ hàng
exports.deleteCart = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the cart by userId and delete it
        const result = await Cart.deleteOne({ userId });
        
        // Check if any document was deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.updateQuantity = async (req, res) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
        if (productIndex > -1) {
            // Cập nhật số lượng sản phẩm
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};