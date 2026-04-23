const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');
const WardrobeItem = require('../models/WardrobeItem');
const auth = require('../middleware/auth');

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
    
    if (items.length === 0) {
      return res.status(400).json({ msg: 'Archive is empty. Add pieces first.' });
    }

    // Grouping
    const tops = items.filter(i => ['shirt', 't-shirt', 'polo', 'knitwear'].includes(i.category));
    const bottoms = items.filter(i => i.category === 'pants');
    const shoes = items.filter(i => i.category === 'shoes');
    const outer = items.filter(i => i.category === 'outerwear');
    const accessories = items.filter(i => i.category === 'accessory');

    if (tops.length === 0 || bottoms.length === 0) {
      return res.status(400).json({ msg: 'Insufficient variety to compose looks. Ensure you have at least one top and one bottom.' });
    }

    const suggestions = [];
    const seenCombos = new Set();
    
    // Generate all possible core combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        // If shoes exist, we can create versions with and without shoes
        const baseItems = [top, bottom];
        
        // Option 1: Top + Bottom only
        const comboKey = `${top._id}-${bottom._id}`;
        if (!seenCombos.has(comboKey)) {
          suggestions.push({
            name: `Composition ${suggestions.length + 1}`,
            items: baseItems,
            occasion: 'casual'
          });
          seenCombos.add(comboKey);
        }

        // Option 2: Top + Bottom + Shoe (if shoes exist)
        if (shoes.length > 0) {
          for (const shoe of shoes) {
            const comboWithShoeKey = `${top._id}-${bottom._id}-${shoe._id}`;
            if (!seenCombos.has(comboWithShoeKey)) {
              suggestions.push({
                name: `Composition ${suggestions.length + 1}`,
                items: [...baseItems, shoe],
                occasion: 'casual'
              });
              seenCombos.add(comboWithShoeKey);
            }
          }
        }
      }
    }

    // Add some randomness and limit to 8 suggestions max
    const finalSuggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    res.json(finalSuggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
