const express = require('express');
const app = express();
const port = 4001;
require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {Server} = require('socket.io');
const SocketManager = require('./socketManager');

const cors = require('cors');
const http = require('http');

app.use(express.json());
app.use(cors());

// Create an HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this based on your frontend origin
    methods: ['GET', 'POST'],
  },
});

// Pass the `io` instance to SocketManager
SocketManager(io);

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