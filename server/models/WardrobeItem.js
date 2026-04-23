const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['shirt', 't-shirt', 'polo', 'knitwear', 'pants', 'outerwear', 'shoes', 'accessory', 'other'],
  },
  tags: [String],
  imageUrl: {
    type: String,
    required: true,
  },
  color: String,
  brand: String,
  fabric: String,
  forSale: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
