const Client = require('../models/Client');
const mongoose = require('mongoose');

// ✅ Get all clients with pagination, search, and soft delete filter
exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = { isDeleted: false };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const clients = await Client.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Client.countDocuments(query);
    
    res.json({
      clients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single client - with ObjectId validation
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    
    const client = await Client.findOne({ _id: id, isDeleted: false });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Get client error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create client - with validation
exports.createClient = async (req, res) => {
  try {
    const { name, company, email, phone, status } = req.body;
    
    // ✅ Validate required fields
    if (!name || !company || !email || !phone) {
      return res.status(400).json({ 
        message: 'Name, company, email, and phone are required' 
      });
    }
    
    // ✅ Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }
    
    const client = new Client({
      name,
      company,
      email,
      phone,
      status: status || 'Active',
      createdBy: req.user.id
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update client - with ObjectId validation
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }
    
    const client = await Client.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
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

// ✅ Soft Delete client - with ObjectId validation
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    const activeClients = await Client.countDocuments({ status: 'Active', isDeleted: false });
    res.json({
      totalClients,
      activeCases: 89,
      documents: 1842,
      consultants: 18
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};