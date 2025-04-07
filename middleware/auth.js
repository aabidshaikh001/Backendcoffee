const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ message: 'Account is disabled' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid', error: error.message });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
};

// Check if user is admin or editor
exports.isAdminOrEditor = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin or editor privileges required' });
  }
};

// Check if user is owner or admin
exports.isOwnerOrAdmin = (req, res, next) => {
  if (
    req.user && 
    (req.user.role === 'admin' || req.user._id.toString() === req.params.id)
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, you can only modify your own account' });
  }
};

