const jwt = require('jsonwebtoken');

let users = {};

module.exports = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    console.log("Received token:", token);
  
    if (!token) {
      console.error('Authentication error: Token required');
      return next(new Error('Authentication error: Token required'));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      console.log("User authenticated with ID:", socket.userId);
      next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id} with user ID: ${socket.userId}`);

    // Set username and store user in the users map by userId
    socket.on('setUsername', (userData) => {
      const { userId, username } = userData;
      users[userId] = { socketId: socket.id, username };
      console.log("Current users:", users);
      
      // Broadcast updated user list to all connected clients
      io.emit('updateUserList', Object.values(users).map(({ username }) => username));
    });

    // Handle incoming messages
    socket.on("message", async (message) => {
      console.log("Server received message event:", message);

      const sender = users[socket.userId];
      if (!sender) return;

      const { text, recipientId } = message;
      try {
        // Get or create the conversation
        const recipient = users[recipientId] ? recipientId : null;
        const participants = recipient ? [sender.userId, recipient] : [sender.userId];
        const conversation = await ConversationController.createOrFindConversation(participants);
        
        // Save and broadcast the message
        const newMessage = await MessageController.saveMessage(conversation._id, sender.userId, text);
        console.log("Message saved and broadcasting:", newMessage);

        if (recipientId === "All") {
          io.emit("message", newMessage);
        } else if (recipient) {
          const recipientSocketId = users[recipient].socketId;
          io.to(recipientSocketId).emit("privateMessage", newMessage);
          socket.emit("privateMessage", newMessage);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    // Handle typing event
    socket.on('typing', ({ recipientId, feedback }) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', { recipientId, feedback });
      } else if (users[recipientId]) {
        const recipientSocketId = users[recipientId].socketId;
        io.to(recipientSocketId).emit('typing', { recipientId, feedback });
      }
    });

    // Handle stop typing event
    socket.on('stopTyping', (recipientId) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', { recipientId, feedback: '' });
      } else if (users[recipientId]) {
        const recipientSocketId = users[recipientId].socketId;
        io.to(recipientSocketId).emit('typing', { recipientId, feedback: '' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      delete users[socket.userId];
      io.emit('updateUserList', Object.values(users).map(({ username }) => username));
    });
  });
};
