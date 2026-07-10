const Client = require('../models/Client');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const sanitizeString = (str) => str?.trim() || '';

// ✅ Get all clients - DIRECT ARRAY (no pagination)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ isDeleted: false })
      .select('name company email phone status _id contactPerson onboardingDate')
      .sort({ createdAt: -1 });
    
    // ✅ Direct array response
    res.json(clients);
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single client
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const client = await Client.findOne({ _id: id, isDeleted: false })
      .select('name company email phone status contactPerson onboardingDate createdBy createdAt');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Get client by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create client
exports.createClient = async (req, res) => {
  try {
    const { name, company, email, phone, status } = req.body;

    const sanitized = {
      name: sanitizeString(name),
      company: sanitizeString(company),
      email: sanitizeString(email).toLowerCase(),
      phone: sanitizeString(phone),
      status: status || 'Active',
      createdBy: req.user.id
    };

    if (!sanitized.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const existingClient = await Client.findOne({ email: sanitized.email });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const client = new Client(sanitized);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const { name, company, email, phone, status } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = sanitizeString(name);
    if (company !== undefined) updateData.company = sanitizeString(company);
    if (email !== undefined) {
      const sanitizedEmail = sanitizeString(email).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }
      updateData.email = sanitizedEmail;
    }
    if (phone !== undefined) updateData.phone = sanitizeString(phone);
    if (status !== undefined) updateData.status = status;

    const client = await Client.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Update client error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Soft Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({ isDeleted: false });
    const activeClients = await Client.countDocuments({ 
      status: 'Active', 
      isDeleted: false 
    });
    res.json({
      totalClients,
      activeCases: 89,
      documents: 1842,
      consultants: 18
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};