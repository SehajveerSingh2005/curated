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
    required: false, // Set to false for now if authentication isn't fully enforced yet, but recommended true
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
