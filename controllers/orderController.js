const Order = require('../models/Order');
const Product = require('../models/Product'); 

// Hàm định dạng ngày
const formatDate = (dateString) => {
    const date = new Date(dateString); 
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear(); 
    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 
    const seconds = String(date.getSeconds()).padStart(2, '0'); 

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Create a new order
exports.createOrder = async (req, res) => {
    const { userId, products, totalPrice, paymentMethod } = req.body;
    try {
        const newOrder = new Order({ userId, products, totalPrice, paymentMethod });
        
        // Kiểm tra dữ liệu trước khi lưu
        console.log('Creating order with data:', { userId, products, totalPrice, paymentMethod });
        
        await newOrder.save();

        // Cập nhật stock sản phẩm sau khi tạo đơn hàng thành công
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            } else {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
        }

        res.status(201).json(newOrder);
    } catch (err) {
        console.error('Error creating order:', err); // Thêm log chi tiết lỗi
        res.status(500).json({ error: 'Error creating order' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Định dạng ngày trước khi trả về
        order.date = formatDate(order.date);
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order' });
    }
};

// Xóa đơn hàng theo ID
exports.deleteOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const deletedOrder = await Order.findById(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Cập nhật lại stock cho từng sản phẩm trong đơn hàng
        for (const item of deletedOrder.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity; // Hoàn lại số lượng vào stock
                await product.save(); // Lưu lại sản phẩm sau khi cập nhật
            }
        }

        // Xóa đơn hàng
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).json({ error: 'Error deleting order' });
    }
};



// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    const { userId } = req.params; // Lấy userId từ params
    try {
        const orders = await Order.find({ userId })
            .populate('products.productId'); // Dùng populate để lấy thông tin đầy đủ của sản phẩm

        // Định dạng ngày cho từng đơn hàng và thông tin sản phẩm
        const formattedOrders = orders.map(order => {
            return {
                id: order._id,
                userId: order.userId,
                totalPrice: order.totalPrice,
                status: order.status,
                paymentMethod: order.paymentMethod,
                date: formatDate(order.date),
                products: order.products.map(product => ({
                    id: product.productId._id,
                    name: product.productId.name,
                    price: product.productId.price,
                    imageUrl: product.productId.imageUrl,
                    description: product.productId.description,
                    category: product.productId.category,
                    brand: product.productId.brand,
                    sizes: product.productId.sizes,
                    colors: product.productId.colors,
                    material: product.productId.material,
                    gender: product.productId.gender,
                    quantity: product.quantity
                }))
            };
        });

        res.status(200).json(formattedOrders);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};
