// routes/cart.js
const express = require('express');
const User    = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require auth
router.use(protect);

// GET /api/cart  – return populated cart for current user
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/cart  – add or increment item  { productId, quantity }
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user   = await User.findById(req.user._id);
    const idx    = user.cart.findIndex(i => i.product.toString() === productId);

    if (idx > -1) {
      user.cart[idx].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const populated = await User.findById(req.user._id).populate('cart.product');
    res.json(populated.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/cart/:productId  – update quantity  { quantity }
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const user  = await User.findById(req.user._id);
    const item  = user.cart.find(i => i.product.toString() === req.params.productId);

    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    const populated = await User.findById(req.user._id).populate('cart.product');
    res.json(populated.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart/:productId  – remove item
router.delete('/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart  = user.cart.filter(i => i.product.toString() !== req.params.productId);
    await user.save();
    const populated = await User.findById(req.user._id).populate('cart.product');
    res.json(populated.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/cart  – clear entire cart
router.delete('/', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
