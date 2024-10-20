const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String },
    brand: { type: String, required: true },
    sizes: [{ type: Number, required: true }],
    colors: [{ type: String, required: true }],
    material: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'unisex'], required: true },
});

module.exports = mongoose.model('Product', ProductSchema);
