const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contract = require('../models/Contract');

// GET - All contracts for a client
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const contracts = await Contract.find({ clientId: req.params.clientId })
      .populate('createdBy', 'name email');
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create contract
router.post('/', auth, async (req, res) => {
  try {
    const contract = new Contract({
      ...req.body,
      createdBy: req.user.id
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Update contract
router.put('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete contract
router.delete('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;