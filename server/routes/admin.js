// routes/admin.js
const express  = require('express');
const User     = require('../models/User');
const Order    = require('../models/Order');
const Contact  = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes
router.use(protect, adminOnly);

// GET /api/admin/stats  – dashboard summary
router.get('/stats', async (req, res) => {
  try {
    const [users, orders, messages] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Contact.countDocuments()
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      users,
      orders,
      messages,
      revenue: revenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
