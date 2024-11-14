const express = require('express');
const router = express.Router();
const userRoutes = require('./routes/userRoutes');

router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

router.use('/users', userRoutes);

module.exports = router;