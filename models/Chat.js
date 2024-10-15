const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
 username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    messages: [MessageSchema] // Use the message schema for better structure
});

module.exports = mongoose.model('Chat', ChatSchema);
