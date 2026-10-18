// routes/testimonials.js
const express      = require('express');
const Testimonial  = require('../models/Testimonial');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/testimonials  – public: approved only
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/testimonials  – public: submit (pending approval)
router.post('/', async (req, res) => {
  try {
    const { author, date, content } = req.body;
    if (!author || !content)
      return res.status(400).json({ message: 'author and content are required' });

    const t = await Testimonial.create({ author, date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), content, approved: false });
    res.status(201).json({ message: 'Thank you! Your review will be published after approval.', id: t._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/testimonials/all  – admin: all including unapproved
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/testimonials/:id  – admin: approve/reject
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/testimonials/:id  – admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
