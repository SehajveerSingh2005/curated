const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const WardrobeItem = require('../models/WardrobeItem');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// @route   GET /api/wardrobe
// @desc    Get all wardrobe items
router.get('/', async (req, res) => {
  try {
    const items = await WardrobeItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/wardrobe
// @desc    Add a new wardrobe item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, tags, color, brand, fabric, forSale } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

    const newItem = new WardrobeItem({
      name,
      category,
      tags: tags ? JSON.parse(tags) : [],
      imageUrl,
      color,
      brand,
      fabric,
      forSale: forSale === 'true'
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/wardrobe/:id
// @desc    Delete a wardrobe item
router.delete('/:id', async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
