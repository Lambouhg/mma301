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
// Send a new message
exports.sendMessage = async (req, res) => {
    const { message } = req.body; // Removed sender from body as it will be set from user context

    // Validate message
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const userId = req.params.userId; // Get the userId from request parameters
        const user = await User.findById(userId); // Find user by userId

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sender = user.username; // Get the username from the user document

        let chat = await Chat.findOne({ userId: userId });
        if (!chat) {
            chat = new Chat({ userId: userId, messages: [] });
        }

        // Push new message to chat
        chat.messages.push({ sender, message });
        await chat.save();

        // Return the updated chat object
        res.status(200).json(chat);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: 'Error sending message' });
    }
};
