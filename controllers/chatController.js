const Chat = require('../models/Chat');
const User = require('../models/User');
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
    const { message } = req.body; // Get the message from request body

    // Validate message
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const userId = req.params.userId; // Get userId from request parameters
        const user = await User.findById(userId); // Find the user by userId

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sender = user.username; // Get the username from the user document

        // Find or create a new chat document for the user
        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({ userId, messages: [] }); // Initialize chat with empty messages
        }

        // Push the new message to the chat
        chat.messages.push({ sender, message });
        await chat.save(); // Save the updated chat document

        // Return the updated chat object
        res.status(200).json(chat);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: 'Error sending message' });
    }
};
        res.status(500).json({ error: 'Error sending message' });
    }
};
