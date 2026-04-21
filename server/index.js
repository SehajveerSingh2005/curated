const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const wardrobeRoutes = require('./routes/wardrobe');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Curated API is running' });
});

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/curated';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    // Continue running server even if DB fails for now
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (Offline)`);
    });
  });
