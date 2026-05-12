const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');
const WardrobeItem = require('../models/WardrobeItem');
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

// @route   GET /api/outfits
// @desc    Get user's saved outfits
router.get('/', auth, async (req, res) => {
  try {
    const outfits = await Outfit.find({ userId: req.user.id })
      .populate('items')
      .sort({ createdAt: -1 });
    res.json(outfits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/outfits
// @desc    Save an outfit
router.post('/', auth, async (req, res) => {
  try {
    const { name, items, occasion, tags } = req.body;
    
    const newOutfit = new Outfit({
      name,
      items,
      occasion,
      tags,
      userId: req.user.id
    });

    const outfit = await newOutfit.save();
    const populatedOutfit = await Outfit.findById(outfit._id).populate('items');
    res.json(populatedOutfit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/outfits/:id
// @desc    Delete an outfit
router.delete('/:id', auth, async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) return res.status(404).json({ msg: 'Outfit not found' });
    if (outfit.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await outfit.deleteOne();
    res.json({ msg: 'Outfit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/outfits/generate
// @desc    Generate outfit suggestions from wardrobe
router.post('/generate', auth, async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: req.user.id });
    
    if (items.length < 2) {
      return res.status(400).json({ msg: 'Archive too small. Add more pieces first.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ msg: 'GEMINI_API_KEY is not configured in the server environment.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Prepare the items payload for the AI
    const wardrobeData = items.map(i => ({
      id: i._id,
      category: i.category,
      name: i.name,
      color: i.color,
      fabric: i.fabric,
      brand: i.brand,
      tags: i.tags
    }));

    const promptText = `
You are a high-end fashion stylist. The user has the following wardrobe items:
${JSON.stringify(wardrobeData, null, 2)}

Create 3 to 5 stylish, highly cohesive, minimal outfit combinations from these items. 
Each outfit must make sense aesthetically (color blocking, textures, brand synergy).
Do not just mix random items. An outfit generally needs at least a top and a bottom. It can also include outerwear, shoes, and accessories/hats. Make sure items in an outfit actually match.
Return ONLY JSON matching this exact schema:
[
  {
    "name": "Outfit Name (e.g. Minimalist Tech, Earth Tones)",
    "occasion": "casual",
    "items": ["<id1>", "<id2>", "<id3>"] 
  }
]
IMPORTANT: "items" must be an array of the exact item IDs provided above.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: promptText }] }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonResult;
    try {
      const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      jsonResult = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ msg: 'Failed to parse AI response' });
    }

    // Map back the actual items to the IDs
    const populatedSuggestions = jsonResult.map(outfit => {
      return {
        name: outfit.name,
        occasion: outfit.occasion || 'casual',
        items: outfit.items.map(id => items.find(i => i._id.toString() === id)).filter(Boolean)
      };
    });

    res.json(populatedSuggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
