const { Chat } = require('../models/index');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// @desc    Get or create chat between user and vendor
// @route   POST /api/chat/start
// @access  Private
const startChat = async (req, res) => {
  try {
    const { vendorId } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

    // Check if chat exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, vendor.user] },
      vendor: vendorId,
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, vendor.user],
        vendor: vendorId,
        messages: [],
      });
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar role')
      .populate('vendor', 'businessName images');

    res.json({ chat: populatedChat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'name avatar role')
      .populate('vendor', 'businessName images')
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');

    if (!chat) return res.status(404).json({ message: 'Chat not found.' });

    const isParticipant = chat.participants.some((p) => p._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isParticipant && !isAdmin) return res.status(403).json({ message: 'Not authorized.' });

    // Mark messages as read
    chat.messages.forEach((msg) => {
      if (msg.sender._id.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = Date.now();
      }
    });
    await chat.save();

    res.json({ chat, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) return res.status(404).json({ message: 'Chat not found.' });

    const isParticipant = chat.participants.includes(req.user._id);
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized.' });

    const message = {
      sender: req.user._id,
      content,
      type,
    };

    chat.messages.push(message);
    chat.lastMessage = { content, sender: req.user._id, sentAt: Date.now() };
    await chat.save();

    const newMessage = chat.messages[chat.messages.length - 1];

    // Emit to other participants
    const io = req.app.get('io');
    if (io) {
      const otherParticipants = chat.participants.filter((p) => p.toString() !== req.user._id.toString());
      otherParticipants.forEach((participantId) => {
        io.to(`user_${participantId}`).emit('new_message', {
          chatId: chat._id,
          message: { ...newMessage.toObject(), sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar } },
        });
      });
    }

    res.json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread message count
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id });
    let unreadCount = 0;
    chats.forEach(chat => {
      const hasUnread = chat.messages.some(m => m.sender.toString() !== req.user._id.toString() && !m.isRead);
      if (hasUnread) unreadCount++;
    });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chats for admin
// @route   GET /api/chat/admin/all
// @access  Private/Admin
const getAllChatsAdmin = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('participants', 'name avatar role')
      .populate('vendor', 'businessName images')
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startChat, getMyChats, getChatMessages, sendMessage, getUnreadCount, getAllChatsAdmin };
