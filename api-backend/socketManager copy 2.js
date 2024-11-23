const jwt = require('jsonwebtoken');

let users = {};

module.exports = (io) => {

  let socketsConnected = new Set();
  let users = {};
  
  io.on('connection', (socket) => { //新客户端连接时
    console.log(`New client connected: ${socket.id}`)
    socketsConnected.add(socket.id);//记录其 socket.id 并添加到 socketsConnected
  
    // 当客户端设置用户名时，更新 users 并广播更新的用户列表
    socket.on('setUsername', (username) => {
      if (users[socket.id] !== username) { // 仅在用户名发生变化时更新
        users[socket.id] = username;
        console.log("List :", users);
        io.emit('updateUserList', users);
      }
      
    })
  
    // Gérer coté back end la réception et l’émission des messages
    socket.on('message',(message) => {
      console.log("Message: ", message);
  
      if(message.recipientId === 'All') {
        io.emit('message', message);
  
      }else if (users[message.recipientId]) {
        //Gérer l’envoi d’un message privé
        console.log("Message privé: ", message);
        io.to(message.recipientId).emit('privateMessage', message);
        socket.emit('privateMessage', message);
      }
      
    })

    io.emit('clientsTotal', socketsConnected.size);
  
    // 当客户端断开连接时，从 socketsConnected 和 users 中移除，并广播更新后的用户列表
    socket.on('disconnect', () => {
      console.log(`Client disconnected : ${socket.id}`)
      socketsConnected.delete(socket.id);
      delete users[socket.id];
      io.emit('updateUserList', users);
    });
  
    // //当用户输入时，向目标会话（公共或私聊）发送“正在输入”状态。
    // socket.on('typing', ({recipientId, feedback}) => {
    //   console.log(`Typing from ${socket.id} to ${recipientId}: ${feedback}`);
    //   console.log('user :', recipientId)
    //   if (recipientId === 'All') {
    //     socket.broadcast.emit('typing', {recipientId, feedback});
    //     console.log(`Typing all ${socket.id} to ${recipientId}: ${feedback}`);
    //   } else if (recipientId) {
    //     socket.to(recipientId).emit('typing', {recipientId, feedback});
    //     console.log(`Typing private ${socket.id} to ${recipientId}: ${feedback}`);
    //   }
    // })
  
    // // 当用户停止输入时，清除“正在输入”状态。
    // socket.on('stopTyping', (recipientId) => {
    //   console.log(`Stop typing from ${socket.id} to ${recipientId}`);
    //   console.log('user :', recipientId)
  
    //   if (recipientId === 'All') {
    //     socket.broadcast.emit('typing', {recipientId, feedback: ''});
    //   } else if (recipientId) {
    //     socket.to(recipientId).emit('typing', {recipientId, feedback: ''});
    //   }
    // })
  
  });
};
