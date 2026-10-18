// routes/contact.js
const express  = require('express');
const Contact  = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact  – public: save contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'name, email and message are required' });

    const contact = await Contact.create({ name, email, message });
    res.status(201).json({ message: 'Message received! We will contact you soon.', id: contact._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/contact  – admin: list all messages
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/contact/:id  – admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
