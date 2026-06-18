const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const wardrobeRoutes = require('./routes/wardrobe');
const outfitRoutes = require('./routes/outfits');
const feedRoutes = require('./routes/feed');
const marketplaceRoutes = require('./routes/marketplace');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/marketplace', marketplaceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Curated API is running' });
});

// Database connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('WARNING: MONGO_URI is not defined in the environment variables.');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => {
      const dbType = MONGO_URI.includes('atlassian') || MONGO_URI.includes('mongodb+srv') ? 'Cloud (Atlas)' : 'Local';
      console.log(`Connected to MongoDB [${dbType}]`);
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: err.stack
  });
});

// Start the server only when running locally (direct execution)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
