const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

console.log('✅ userRoutes.js loaded - Production Fix');

const ALLOWED_FOLDERS = [
  'registrations', 'contracts', 'policies', 'corporate-secretariat',
  'hr', 'gst', 'income-tax', 'financials'
];

// ✅ Validation Rules - FIXED (Relaxed for folderPermissions)
const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .if((value, { req }) => req.method === 'POST')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'lawyer', 'consultant', 'manager']).withMessage('Invalid role'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status'),
  // ✅ folderPermissions validation relaxed: allow empty array or array of strings
  body('folderPermissions')
    .optional()
    .customSanitizer(value => {
      // Ensure it's always an array
      if (!value) return [];
      if (!Array.isArray(value)) return [value];
      return value;
    })
    .custom((value) => {
      if (!Array.isArray(value)) return true;
      // ✅ Filter out non-string items
      return true; // We'll filter in the controller
    })
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET - All users (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('❌ GET users error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST - Create user (Admin only)
router.post('/', [auth, admin], validateUser, handleValidation, async (req, res) => {
  try {
    console.log('📥 POST /api/users - Request body:', JSON.stringify(req.body, null, 2));

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

    // ✅ Filter valid folder permissions (ensure array of strings)
    let validPermissions = [];
    if (folderPermissions && Array.isArray(folderPermissions)) {
      validPermissions = folderPermissions
        .filter(f => typeof f === 'string') // Only keep strings
        .filter(f => ALLOWED_FOLDERS.includes(f)); // Only keep allowed ones
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

// ✅ PUT - Update user
router.put('/:id', auth, validateUser, handleValidation, async (req, res) => {
  try {
    const { name, email, department, role, status, phone, folderPermissions, password } = req.body;
    
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const updateData = {
      name: name || existingUser.name,
      department: department || existingUser.department || 'General',
      phone: phone || existingUser.phone || '',
      status: status || existingUser.status || 'Active'
    };

    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (email) updateData.email = email;
      if (folderPermissions) {
        updateData.folderPermissions = folderPermissions
          .filter(f => typeof f === 'string')
          .filter(f => ALLOWED_FOLDERS.includes(f));
      }
    }

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
    console.error('❌ DELETE error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;