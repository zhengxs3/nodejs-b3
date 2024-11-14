const Conversation = require('../models/conversationModel');

exports.createOrFindConversation = async (participants) => {
  try {
    // Check if a conversation exists with the same participants
    let conversation = await Conversation.findOne({ participants: { $all: participants } });
    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }
    return conversation;
  } catch (error) {
    console.error('Error creating or finding conversation:', error);
    throw error;
  }
};

exports.getUserConversations = async (userId) => {
  try {
    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageTimestamp: -1 })
      .populate('participants', 'username'); // Populate to get usernames of participants
    return conversations;
  } catch (error) {
    console.error('Error retrieving user conversations:', error);
    throw error;
  }
};

exports.updateLastMessage = async (conversationId, messageText) => {
  try {
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageText,
      lastMessageTimestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating last message:', error);
    throw error;
  }
};
