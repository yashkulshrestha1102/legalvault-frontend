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

// GET - All users (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create user (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    console.log('📥 POST /api/users - Request body:', req.body);

    const { name, email, password, department, role, status, phone, folderPermissions } = req.body;
    
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

    let validPermissions = [];
    if (folderPermissions && Array.isArray(folderPermissions)) {
      validPermissions = folderPermissions.filter(f => ALLOWED_FOLDERS.includes(f));
    }

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
    console.log('✅ User saved:', user.email);
    
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

// ✅ PUT - Update user (Allow users to update their own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, department, role, status, phone, folderPermissions, password } = req.body;
    
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // ✅ Build update data
    const updateData = {
      name: name || existingUser.name,
      department: department || existingUser.department || 'General',
      phone: phone || existingUser.phone || '',
      status: status || existingUser.status || 'Active'
    };

    // ✅ Only admin can update role, email, and folderPermissions
    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (email) updateData.email = email;
      if (folderPermissions) {
        updateData.folderPermissions = folderPermissions.filter(f => ALLOWED_FOLDERS.includes(f));
      }
    }

    // ✅ If password is provided, hash it
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('❌ PUT error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete user (Admin only)
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