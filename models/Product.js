const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String },
    brand: { type: String, required: true }, // Thương hiệu của giày
    sizes: [{ type: Number, required: true }], // Danh sách các kích cỡ giày
    colors: [{ type: String, required: true }], // Danh sách các màu sắc
    material: { type: String, required: true }, // Chất liệu của giày
    gender: { type: String, enum: ['male', 'female', 'unisex'], required: true }, // Giới tính
});

module.exports = mongoose.model('Product', ProductSchema);
