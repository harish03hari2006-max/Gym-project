// routes/workoutPlans.js
const express     = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/plans                  – public
router.get('/', async (req, res) => {
  try {
    const plans = await WorkoutPlan.find().sort({ level: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/plans/:id
router.get('/:id', async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/plans                 – admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const plan = await WorkoutPlan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// PUT /api/plans/:id              – admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// DELETE /api/plans/:id           – admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
