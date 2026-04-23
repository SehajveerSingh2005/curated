const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const wardrobeRoutes = require('./routes/wardrobe');
const outfitRoutes = require('./routes/outfits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Curated API is running' });
});

// Database connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    const dbType = MONGO_URI.includes('atlassian') || MONGO_URI.includes('mongodb+srv') ? 'Cloud (Atlas)' : 'Local';
    console.log(`Connected to MongoDB [${dbType}]`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: err.stack
  });
});
