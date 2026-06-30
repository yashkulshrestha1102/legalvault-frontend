const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

console.log('✅ userRoutes.js loaded - Production Fix');

const ALLOWED_FOLDERS = [
  'registrations', 'contracts', 'policies', 'corporate-secretariat',
  'hr', 'gst', 'income-tax', 'financials'
];

// GET - All users
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create user
router.post('/', [auth, admin], async (req, res) => {
  try {
    console.log('📥 POST /api/users - Request body:', req.body);

    const { name, email, password, department, role, status, phone, folderPermissions } = req.body;
    
    console.log('📥 folderPermissions received:', folderPermissions);

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Filter valid folder permissions
    let validPermissions = [];
    if (folderPermissions && Array.isArray(folderPermissions)) {
      validPermissions = folderPermissions.filter(f => ALLOWED_FOLDERS.includes(f));
    }
    console.log('✅ Valid permissions:', validPermissions);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      department: department || 'General',
      role: role || 'user',
      status: status || 'Active',
      phone: phone || '',
      folderPermissions: validPermissions
    });

    await user.save();
    console.log('✅ User saved with permissions:', user.folderPermissions);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('❌ POST error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update user
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { name, email, department, role, status, phone, folderPermissions } = req.body;
    
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let validPermissions = [];
    if (folderPermissions && Array.isArray(folderPermissions)) {
      validPermissions = folderPermissions.filter(f => ALLOWED_FOLDERS.includes(f));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        email, 
        department, 
        role, 
        status,
        phone: phone || existingUser.phone,
        folderPermissions: validPermissions
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('❌ PUT error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete user
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;