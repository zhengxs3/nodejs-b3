const jwt = require('jsonwebtoken');

let users = {};
let lastMessageTimestamps = {}; // 存储每个用户最后发送消息的时间戳

module.exports = (io) => {

  let socketsConnected = new Set();
  let users = {};
  
  io.on('connection', (socket) => {
    console.log(`New client connected : ${socket.id}`)
    socketsConnected.add(socket.id);

    // 向所有其他用户发送通知
    socket.broadcast.emit('userNotification', '一个用户加入了聊天');
  
    socket.on('setUsername', (username) => {
      users[socket.id] = username;
      console.log("Liste d'utilisateurs : ", users);
      io.emit('updateUserList', users);
    })
  
    socket.on('message', (message) => {
      const now = new Date().getTime();

      const lastMessageTime = lastMessageTimestamps[socket.id] || 0;
      const timeDiff = now - lastMessageTime;

      if (timeDiff < 5000) { // 每秒只允许发送一条消息
        console.log("Vous envoye trop tôt, resseyer plus tard");

        // 可以发送一条消息给客户端通知过快
        socket.emit('messageTropVite', { error: 'Vous envoye trop tôt, resseyer plus tard' });
        return;
      }

      lastMessageTimestamps[socket.id] = now;

      console.log("Message : ", message);
      if(message.recipientId === 'All') {
        io.emit('message', message);
      } else {
        io.to(message.recipientId).emit('privateMessage', message);
        socket.emit('privateMessage', message);
      }
    })
  
    io.emit('clientsTotal', socketsConnected.size);
  
    socket.on('disconnect', () => {
      console.log(`Client disconnected : ${socket.id}`)
      socketsConnected.delete(socket.id);
      delete users[socket.id];

      io.emit('updateUserList', users);
      io.emit('clientsTotal', socketsConnected.size);
    });


    //typing
    socket.on('typing', ({recipientId, feedback}) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', {recipientId, feedback});
        console.log("salle:",recipientId)
      } else {
        socket.to(recipientId).emit('typing', {recipientId, feedback});
        console.log("salle:",recipientId)
      }
    })
  
    socket.on('stopTyping', (recipientId) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', {recipientId, feedback: ''});
        console.log("salle:",recipientId)
      } else {
        socket.to(recipientId).emit('typing', {recipientId, feedback: ''});
        console.log("salle:",recipientId)
      }
    })
  
  });
};
