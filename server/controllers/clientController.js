const Client = require('../models/Client');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const sanitizeString = (str) => str?.trim() || '';

// ✅ Helper: Get folder permissions for a user
const getUserFolderPermissions = (client, userId) => {
  if (!client || !client.userPermissions) return [];
  const userPerm = client.userPermissions.find(p => 
    String(p.userId) === String(userId)
  );
  return userPerm?.folderPermissions || [];
};

// ✅ Get all clients (filtered by role)
exports.getClients = async (req, res) => {
  try {
    const user = req.user;
    const query = { isDeleted: false };
    
    const clients = await Client.find(query)
      .select('name company email phone status _id contactPerson onboardingDate userPermissions')
      .populate('userPermissions.userId', 'name email role')
      .sort({ createdAt: -1 });
    
    // ✅ Filter clients for non-admin users
    let filteredClients = clients;
    if (user.role !== 'admin') {
      filteredClients = clients.filter(client => 
        client.userPermissions.some(p => String(p.userId._id || p.userId) === String(user.id))
      );
    }
    
    res.json(filteredClients);
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single client (with access check)
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const query = { _id: id, isDeleted: false };
    
    const client = await Client.findOne(query)
      .select('name company email phone status contactPerson onboardingDate createdBy createdAt userPermissions')
      .populate('userPermissions.userId', 'name email role');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // ✅ Check access for non-admin
    if (user.role !== 'admin') {
      const hasAccess = client.userPermissions.some(p => 
        String(p.userId._id || p.userId) === String(user.id)
      );
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    res.json(client);
  } catch (error) {
    console.error('❌ Get client by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create client (Admin only)
exports.createClient = async (req, res) => {
  try {
    const { name, company, email, phone, status, contactPerson, onboardingDate, userPermissions } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create clients' });
    }

    const sanitized = {
      name: sanitizeString(name),
      company: sanitizeString(company),
      email: sanitizeString(email).toLowerCase(),
      phone: sanitizeString(phone),
      status: status || 'Active',
      contactPerson: sanitizeString(contactPerson || ''),
      onboardingDate: onboardingDate || '',
      userPermissions: userPermissions || [],
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
    
    const populatedClient = await Client.findById(client._id)
      .populate('userPermissions.userId', 'name email role');
    
    res.status(201).json(populatedClient);
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update client (Admin only)
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update clients' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const { name, company, email, phone, status, contactPerson, onboardingDate, userPermissions } = req.body;

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
    if (contactPerson !== undefined) updateData.contactPerson = sanitizeString(contactPerson);
    if (onboardingDate !== undefined) updateData.onboardingDate = onboardingDate;
    if (userPermissions !== undefined) {
      // ✅ Validate userPermissions
      updateData.userPermissions = userPermissions.filter(p => p.userId && Array.isArray(p.folderPermissions));
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('userPermissions.userId', 'name email role');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('❌ Update client error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete client (Admin only)
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete clients' });
    }

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
    const user = req.user;
    const query = { isDeleted: false };
    
    const totalClients = await Client.countDocuments(query);
    const activeClients = await Client.countDocuments({ 
      ...query,
      status: 'Active'
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