const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔑 Auth - Token received:', token ? '✅ Yes' : '❌ No');

    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const secret = process.env.JWT_SECRET;
    console.log('🔑 Auth - JWT_SECRET exists:', secret ? '✅ Yes' : '❌ No');

    if (!secret) {
      console.error('❌ JWT_SECRET is missing in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    console.log('✅ Auth - User verified:', decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth - Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};