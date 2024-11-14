const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/conversationController');

// Route to create or find a conversation
router.post('/', async (req, res) => {
  const { participants } = req.body;
  try {
    const conversation = await ConversationController.createOrFindConversation(participants);
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating or finding conversation', error: error.message });
  }
});

// Route to get all conversations for a specific user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await ConversationController.getUserConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving conversations', error: error.message });
  }
});

module.exports = router;
