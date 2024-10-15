const Chat = require('../models/Chat');

// Get chat history by User ID
exports.getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.params.userId });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json(chat);
    } catch (err) {
        console.error("Error fetching chat history:", err);
        res.status(500).json({ error: 'Error fetching chat history' });
    }
};

// Send a new message
exports.sendMessage = async (req, res) => {
    const { sender, message } = req.body;

    // Validate sender and message
    if (!sender || !message) {
        return res.status(400).json({ error: 'Sender and message are required' });
    }

    try {
        let chat = await Chat.findOne({ userId: req.params.userId });
        if (!chat) {
            chat = new Chat({ userId: req.params.userId, messages: [] });
        }
        
        chat.messages.push({ sender, message });
        await chat.save();
        
        res.status(200).json(chat); // Return the updated chat object
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: 'Error sending message' });
    }
};
