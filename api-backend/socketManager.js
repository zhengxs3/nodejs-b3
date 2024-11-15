const jwt = require('jsonwebtoken');

let users = {};

module.exports = (io) => {

  let socketsConnected = new Set();
  let users = {};
  
  io.on('connection', (socket) => {
    console.log(`New client connected : ${socket.id}`)
    socketsConnected.add(socket.id);
  
    socket.on('setUsername', (username) => {
      users[socket.id] = username;
      console.log("Liste d'utilisateurs : ", users);
      io.emit('updateUserList', users);
    })
  
    socket.on('message', (message) => {
      console.log("Message : ", message);
      if(message.recipientId === 'All') {
        io.emit('message', message);
      } else {
        io.to(message.recipientId).emit('privateMessage', message);
        socket.emit('privateMessage', message);
      }
    })
  
    socket.on('typing', ({recipientId, feedback}) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', {recipientId, feedback});
      } else {
        socket.to(recipientId).emit('typing', {recipientId, feedback});
      }
    })
  
    socket.on('stopTyping', (recipientId) => {
      if (recipientId === 'All') {
        socket.broadcast.emit('typing', {recipientId, feedback: ''});
      } else {
        socket.to(recipientId).emit('typing', {recipientId, feedback: ''});
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
  
  });
};
