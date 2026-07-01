const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Registration = require('../models/Registration');

// GET - All registrations for a client
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ clientId: req.params.clientId })
      .populate('createdBy', 'name email');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create registration
router.post('/', auth, async (req, res) => {
  try {
    const registration = new Registration({
      ...req.body,
      createdBy: req.user.id
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Update registration
router.put('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete registration
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;