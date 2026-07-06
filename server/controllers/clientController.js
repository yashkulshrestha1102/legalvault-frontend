const Client = require('../models/Client');

// ✅ Get all clients with pagination, search, and soft delete filter
exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = { isDeleted: false }; // ✅ Soft delete filter
    
    // ✅ Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // ✅ Status filter
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

// ✅ Get single client
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, isDeleted: false });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create client
exports.createClient = async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      createdBy: req.user.id
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Soft Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
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