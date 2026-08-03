const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Automation = require('../models/Automation');
const Client = require('../models/Client');
const Document = require('../models/Document');
const Notification = require('../models/Notification');

// ✅ GET - Automation Dashboard Stats
router.get('/', [auth, admin], async (req, res) => {
  try {
    // Count per stage
    const stageStats = await Automation.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    // Count per status
    const statusStats = await Automation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent automations
    const recent = await Automation.find()
      .populate('clientId', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stages: stageStats,
      status: statusStats,
      recent,
      total: await Automation.countDocuments()
    });
  } catch (error) {
    console.error('❌ Automation stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST - Start Automation for a Client
router.post('/start', [auth, admin], async (req, res) => {
  try {
    const { clientId } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if already running
    const existing = await Automation.findOne({ 
      clientId, 
      status: { $in: ['pending', 'processing'] } 
    });
    if (existing) {
      return res.status(400).json({ 
        message: 'Automation already in progress for this client' 
      });
    }

    // Create new automation
    const automation = new Automation({
      clientId,
      createdBy: req.user.id,
      assignedTo: req.user.id,
      stage: 'collection',
      status: 'pending'
    });

    await automation.save();

    // ✅ Create notification
    await Notification.create({
      type: 'system_alert',
      message: `🤖 Automation started for client: ${client.name}`,
      data: { automationId: automation._id, clientId: client._id }
    });

    res.status(201).json({
      message: 'Automation started successfully',
      automation
    });
  } catch (error) {
    console.error('❌ Start automation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET - Single Automation Status
router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('documents', 'name type size uploadedAt')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    res.json(automation);
  } catch (error) {
    console.error('❌ Get automation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ PUT - Update Automation Stage
router.put('/:id/stage', [auth, admin], [
  body('stage').isIn(['collection', 'sorting', 'data_entry', 'compliance']).withMessage('Invalid stage')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { stage, status, validationResults, extractedData } = req.body;

    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // ✅ Update fields
    if (stage) automation.stage = stage;
    if (status) automation.status = status;
    if (validationResults) automation.validationResults = validationResults;
    if (extractedData) automation.extractedData = extractedData;
    
    if (status === 'completed') {
      automation.completedAt = new Date();
    }

    automation.updatedAt = new Date();
    await automation.save();

    // ✅ Create notification for stage completion
    await Notification.create({
      type: 'system_alert',
      message: `✅ Automation stage "${stage}" completed for client`,
      data: { automationId: automation._id, stage }
    });

    res.json({
      message: 'Automation updated successfully',
      automation
    });
  } catch (error) {
    console.error('❌ Update automation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST - Add Documents to Automation
router.post('/:id/documents', [auth, admin], async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({ message: 'documentIds array required' });
    }

    const automation = await Automation.findById(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // ✅ Add documents (avoid duplicates)
    const uniqueDocs = documentIds.filter(id => !automation.documents.includes(id));
    automation.documents.push(...uniqueDocs);
    automation.updatedAt = new Date();
    await automation.save();

    res.json({
      message: `${uniqueDocs.length} documents added to automation`,
      automation
    });
  } catch (error) {
    console.error('❌ Add documents error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ ✅ ✅ STAGE 2: AUTO-SORT DOCUMENTS
router.post('/:id/sort', [auth, admin], async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('documents');
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.documents.length === 0) {
      return res.status(400).json({ message: 'No documents to sort' });
    }

    // ✅ Auto-sort logic
    const sorted = {
      contracts: [],
      petitions: [],
      affidavits: [],
      others: []
    };

    for (const doc of automation.documents) {
      const fileName = doc.name ? doc.name.toLowerCase() : '';
      
      if (fileName.includes('contract') || fileName.includes('agreement')) {
        sorted.contracts.push(doc);
      } else if (fileName.includes('petition') || fileName.includes('application')) {
        sorted.petitions.push(doc);
      } else if (fileName.includes('affidavit') || fileName.includes('declaration')) {
        sorted.affidavits.push(doc);
      } else {
        sorted.others.push(doc);
      }
    }

    // ✅ Update automation with sorted data
    automation.extractedData = {
      sortedDocuments: sorted,
      totalCount: automation.documents.length,
      sortedAt: new Date()
    };
    automation.stage = 'sorting';
    automation.status = 'processing';
    await automation.save();

    // ✅ Create notification
    await Notification.create({
      type: 'system_alert',
      message: `📂 Documents sorted for client`,
      data: { automationId: automation._id, total: automation.documents.length }
    });

    res.json({
      message: 'Documents sorted successfully',
      sorted: sorted,
      total: automation.documents.length
    });
  } catch (error) {
    console.error('❌ Sort error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET - Get sorted documents
router.get('/:id/sorted', [auth, admin], async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('documents');
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const sorted = automation.extractedData?.sortedDocuments || {
      contracts: [],
      petitions: [],
      affidavits: [],
      others: []
    };

    res.json({
      sorted: sorted,
      total: automation.documents.length,
      stage: automation.stage,
      status: automation.status
    });
  } catch (error) {
    console.error('❌ Get sorted error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE - Cancel/Delete Automation
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const automation = await Automation.findByIdAndDelete(req.params.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    await Notification.create({
      type: 'system_alert',
      message: `🗑️ Automation cancelled for client`,
      data: { automationId: automation._id }
    });

    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('❌ Delete automation error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;