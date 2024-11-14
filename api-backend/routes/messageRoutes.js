const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

router.get('/', async (req, res) => {
  try {
    const messages = await MessageController.getAllMessages();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { conversationId, senderId, text } = req.body;
  try {
    const message = await MessageController.saveMessage(conversationId, senderId, text);
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error saving message', error: error.message });
  }
});

router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await MessageController.getConversationMessages(conversationId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error: error.message });
  }
});

module.exports = router;
