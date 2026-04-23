const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: 'New Composition'
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem',
    required: true
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'work', 'sport', 'other'],
    default: 'casual'
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Outfit', outfitSchema);
