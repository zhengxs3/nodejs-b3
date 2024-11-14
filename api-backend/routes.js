const express = require('express');
const router = express.Router();
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');

router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);

module.exports = router;