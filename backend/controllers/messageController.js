import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
    try {
        const { receiver, text } = req.body;

        if (!receiver || !text) {
            return res.status(400).json({ message: 'Receiver and text are required' });
        }

        // Check if receiver exists
        const receiverUser = await User.findById(receiver);
        if (!receiverUser) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver,
            text,
        });

        await message.populate('sender', 'username profilePic');
        await message.populate('receiver', 'username profilePic');

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all conversations
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all messages where user is sender or receiver
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
        })
            .populate('sender', 'username profilePic')
            .populate('receiver', 'username profilePic')
            .sort({ createdAt: -1 });

        // Extract unique users
        const conversationsMap = new Map();

        messages.forEach((message) => {
            const otherUser =
                message.sender._id.toString() === userId.toString()
                    ? message.receiver
                    : message.sender;

            const otherUserId = otherUser._id.toString();

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: message,
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get messages with a specific user
 * @route   GET /api/messages/:userId
 * @access  Private
 */
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        })
            .populate('sender', 'username profilePic')
            .populate('receiver', 'username profilePic')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: error.message });
    }
};
