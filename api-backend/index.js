const express = require('express');
const app = express();
const port = 4001;
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const socketIo = require('socket.io');
const cors = require('cors');
const http = require('http');

app.use(express.json());
app.use(cors());

// Socket IO CONFIG
const server = http.createServer(app); 
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

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

// ROUTES CONFIG
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// SWAGGER INIT CONFIG
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info : {
      title: 'NodeJS B3',
      version: '1.0',
      description: 'Une API de fou malade',
      contact: {
        name: 'Chris'
      },
      servers : [
        {
          url: 'http://localhost:4001'
        },
      ],
    },
  },
  apis: [
    `${__dirname}/routes.js`,
    `${__dirname}/routes/*.js`,
    `${__dirname}/models/*.js`,
    `${__dirname}/controllers/*.js`,
  ],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to the database
mongoose.connect(mongoURI, {})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log(`MongoDB connection error: ${err}`))

app.get('/', (req, res) => {
 res.send("Hello, bienvue sur le serveur"); 
})

// Server.listen a la place de app.listen
server.listen(port, () => {
  console.log("Serveur en ligne port 4001");
})