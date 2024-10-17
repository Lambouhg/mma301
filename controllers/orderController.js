const Order = require('../models/Order');

// Hàm định dạng ngày
const formatDate = (dateString) => {
    const date = new Date(dateString); 
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear(); // Lấy năm
    const hours = String(date.getHours()).padStart(2, '0'); // Lấy giờ
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Lấy phút
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Lấy giây

    // Trả về chuỗi định dạng dd/mm/yyyy hh:mm:ss
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Create a new order
exports.createOrder = async (req, res) => {
    const { userId, products, totalPrice, paymentMethod } = req.body;
    try {
        const newOrder = new Order({ userId, products, totalPrice, paymentMethod });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
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

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
    const { userId } = req.params; // Lấy userId từ params
    try {
        const orders = await Order.find({ userId });

        // Định dạng ngày cho từng đơn hàng
        const formattedOrders = orders.map(order => {
            return {
                ...order.toObject(), // Chuyển đổi đối tượng mongoose thành đối tượng plain
                date: formatDate(order.date) // Áp dụng hàm định dạng ngày
            };
        });

        res.status(200).json(formattedOrders); // Trả về danh sách đơn hàng đã định dạng
    } catch (err) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};
