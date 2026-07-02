const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const AuditLog = require('../models/AuditLog');

// ✅ Get all audit logs (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const { limit = 50, skip = 0, action, entity } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get audit log stats (Admin only)
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalActions = await AuditLog.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActions = await AuditLog.countDocuments({ timestamp: { $gte: today } });

    const actionsByType = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    const actionsByEntity = await AuditLog.aggregate([
      { $group: { _id: '$entity', count: { $sum: 1 } } }
    ]);

    res.json({
      totalActions,
      todayActions,
      actionsByType,
      actionsByEntity
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;