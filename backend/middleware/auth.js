const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getStatus } = require('../config/db');

// In-memory users for fallback
let memoryUsers = [];

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_avatarapp_2026');

    if (getStatus()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = memoryUsers.find(u => u._id === decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_avatarapp_2026');
    if (getStatus()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = memoryUsers.find(u => u._id === decoded.id);
    }
  } catch (e) {
    // Ignore error for optional auth
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
  memoryUsers,
};

