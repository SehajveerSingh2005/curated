const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const WardrobeItem = require('../models/WardrobeItem');
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const { storage, cloudinary } = require('../config/cloudinary');

const upload = multer({ storage });

// @route   GET /api/wardrobe
// @desc    Get current user's wardrobe items
router.get('/', auth, async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/wardrobe
// @desc    Add a new wardrobe item
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    const { name, category, tags, color, brand, fabric, forSale } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    const cloudinaryPublicId = req.file ? req.file.filename : null;

    const newItem = new WardrobeItem({
      name,
      category,
      tags: tags ? JSON.parse(tags) : [],
      imageUrl,
      cloudinaryPublicId,
      color,
      brand,
      fabric,
      forSale: forSale === 'true',
      userId: req.user.id
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/wardrobe/:id
// @desc    Update a wardrobe item
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
  try {
    const { name, category, tags, color, brand, fabric, forSale } = req.body;
    
    // Find existing item
    let item = await WardrobeItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Check user ownership
    if (item.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Build update object
    const updateData = {
      name,
      category,
      color,
      brand,
      fabric,
      forSale: forSale === 'true',
    };

    if (tags) {
      updateData.tags = JSON.parse(tags);
    }

    // Handle new image if provided
    if (req.file) {
      updateData.imageUrl = req.file.path;
      updateData.cloudinaryPublicId = req.file.filename;
      
      // Delete old image from Cloudinary if it exists
      if (item.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(item.cloudinaryPublicId);
        } catch (cloudinaryErr) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryErr);
        }
      }
    } else if (req.body.imageUrl && req.body.imageUrl !== item.imageUrl) {
      // Very rarely updated this way unless URL is external
      updateData.imageUrl = req.body.imageUrl;
    }

    item = await WardrobeItem.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(item);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/wardrobe/analyze
// @desc    Analyze an image with Gemini and return extracted clothing details
router.post('/analyze', auth, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ msg: 'No image provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ msg: 'GEMINI_API_KEY is not configured in the server environment.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Parse the data URL
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      return res.status(400).json({ msg: 'Invalid image format' });
    }
    const mimeType = match[1];
    const data = match[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: data,
                mimeType: mimeType
              }
            },
            {
              text: 'Analyze this clothing item. Extract its name, category (must be one of: shirt, t-shirt, polo, knitwear, pants, outerwear, shoes, accessory, other), brand (from logos or styling), fabric/material, color, and a list of 3-5 style tags. Return ONLY JSON matching this exact schema: {"name": "...", "category": "...", "brand": "...", "fabric": "...", "color": "...", "tags": ["..."]}'
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonResult;
    try {
      jsonResult = JSON.parse(response.text);
    } catch (e) {
      // In case the model returns markdown like ```json ... ```
      const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      jsonResult = JSON.parse(cleaned);
    }

    res.json(jsonResult);
  } catch (err) {
    console.error('AI Analysis error:', err);
    res.status(500).json({ msg: 'Failed to analyze image with AI', error: err.message });
  }
});

// @route   DELETE /api/wardrobe/:id
// @desc    Delete a wardrobe item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    // Check user ownership
    if (item.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete image from Cloudinary if it exists
    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId);
      } catch (cloudinaryErr) {
        console.error('Error deleting image from Cloudinary:', cloudinaryErr);
        // We continue with database deletion even if Cloudinary fails
      }
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
