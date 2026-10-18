// routes/orders.js
const express = require('express');
const Order   = require('../models/Order');
const User    = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders  – create order from current cart  { address }
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user.cart.length)
      return res.status(400).json({ message: 'Cart is empty' });

    const items = user.cart.map(i => ({
      product:  i.product._id,
      name:     i.product.name,
      price:    i.product.price,
      quantity: i.quantity
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user:    req.user._id,
      items,
      total,
      address: req.body.address || {}
    });

    // Clear cart after placing order
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/orders/my  – current user orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/orders         – admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/orders/:id/status  – admin: update status  { status }
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

module.exports = router;
