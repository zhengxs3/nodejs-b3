const Message = require('../models/messageModel');
const ConversationController = require('./conversationController');

exports.getAllMessages = async () => {
  try {
    const messages = await Message.find().populate('sender', 'username');
    return messages;
  } catch (error) {
    console.error('Error retrieving all messages:', error);
    throw error;
  }
};

exports.saveMessage = async (conversationId, senderId, text) => {
  try {
    const message = new Message({
      conversationId,
      sender: senderId,
      text,
    });
    await message.save();

    // Update the conversation's last message and timestamp
    await ConversationController.updateLastMessage(conversationId, text);

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

exports.getConversationMessages = async (conversationId) => {
  try {
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    return messages;
  } catch (error) {
    console.error('Error retrieving conversation messages:', error);
    throw error;
  }
};
