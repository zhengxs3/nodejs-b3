const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
