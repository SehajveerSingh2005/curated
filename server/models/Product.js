const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [String],
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
  },
  color: String,
  brand: String,
  fabric: String,
  condition: {
    type: String,
    enum: ['new', 'like new', 'good', 'fair'],
    default: 'good',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
    index: true,
  },
  wardrobeItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
