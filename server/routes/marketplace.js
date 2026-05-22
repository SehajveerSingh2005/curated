const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const WardrobeItem = require('../models/WardrobeItem');
const auth = require('../middleware/auth');
const { storage, cloudinary } = require('../config/cloudinary');

const upload = multer({ storage });

// @route   GET /api/marketplace
// @desc    Get all marketplace listings
router.get('/', async (req, res) => {
  try {
    const { category, tag, sort } = req.query;
    let query = {}; // Return all (both available and sold) so users can see sold items too

    if (category && category !== 'All') {
      query.category = category.toLowerCase();
    }
    if (tag) {
      query.tags = tag;
    }

    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'Price ↑') {
      sortOption = { price: 1 };
    } else if (sort === 'Price ↓') {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query)
      .populate('seller', 'username')
      .populate('buyer', 'username')
      .sort(sortOption);

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/marketplace
// @desc    Create a new listing (either directly uploaded or from wardrobe)
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    // Check if listing from an existing wardrobe item
    if (req.body.wardrobeItemId) {
      const wardrobeItem = await WardrobeItem.findById(req.body.wardrobeItemId);
      if (!wardrobeItem) {
        return res.status(404).json({ msg: 'Wardrobe item not found' });
      }
      
      // Ensure current user owns this wardrobe item
      if (wardrobeItem.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to list this item' });
      }

      // Check if already listed
      const existingProduct = await Product.findOne({ wardrobeItemId: wardrobeItem._id, status: 'available' });
      if (existingProduct) {
        return res.status(400).json({ msg: 'This item is already listed for sale' });
      }

      const product = new Product({
        name: wardrobeItem.name,
        price: Number(req.body.price),
        category: wardrobeItem.category,
        tags: wardrobeItem.tags,
        imageUrl: wardrobeItem.imageUrl,
        cloudinaryPublicId: wardrobeItem.cloudinaryPublicId,
        color: wardrobeItem.color,
        brand: wardrobeItem.brand,
        fabric: wardrobeItem.fabric,
        condition: req.body.condition || 'good',
        seller: req.user.id,
        wardrobeItemId: wardrobeItem._id
      });

      await product.save();

      // Mark wardrobe item as for sale
      wardrobeItem.forSale = true;
      await wardrobeItem.save();

      const populatedProduct = await Product.findById(product._id).populate('seller', 'username');
      return res.json(populatedProduct);
    }

    // Direct product listing with file upload
    const { name, price, category, tags, color, brand, fabric, condition } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    const cloudinaryPublicId = req.file ? req.file.filename : null;

    if (!imageUrl) {
      return res.status(400).json({ msg: 'Please upload an image' });
    }

    const product = new Product({
      name,
      price: Number(price),
      category: category.toLowerCase(),
      tags: tags ? JSON.parse(tags) : [],
      imageUrl,
      cloudinaryPublicId,
      color,
      brand,
      fabric,
      condition: condition || 'good',
      seller: req.user.id
    });

    await product.save();
    
    const populatedProduct = await Product.findById(product._id).populate('seller', 'username');
    res.json(populatedProduct);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/marketplace/:id/buy
// @desc    Simulate buying a product listing
router.post('/:id/buy', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product listing not found' });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ msg: 'This product has already been sold' });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot purchase your own listing' });
    }

    // Update product listing
    product.status = 'sold';
    product.buyer = req.user.id;
    await product.save();

    // If it was listed from a wardrobe item, update the wardrobe item status and transfer ownership to buyer
    if (product.wardrobeItemId) {
      const wardrobeItem = await WardrobeItem.findById(product.wardrobeItemId);
      if (wardrobeItem) {
        wardrobeItem.forSale = false;
        wardrobeItem.userId = req.user.id;
        await wardrobeItem.save();
      }
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'username')
      .populate('buyer', 'username');

    res.json(populatedProduct);
  } catch (err) {
    console.error('Buy product error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/marketplace/:id
// @desc    Update details of a listed product
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, price, category, tags, color, brand, fabric, condition } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product listing not found' });
    }

    // Ensure the current user is the seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to modify this listing' });
    }

    if (product.status === 'sold') {
      return res.status(400).json({ msg: 'Cannot edit details of a sold product' });
    }

    // Update fields
    if (name) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category.toLowerCase();
    if (tags) product.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (color !== undefined) product.color = color;
    if (brand !== undefined) product.brand = brand;
    if (fabric !== undefined) product.fabric = fabric;
    if (condition) product.condition = condition;

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'username')
      .populate('buyer', 'username');

    res.json(populatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
