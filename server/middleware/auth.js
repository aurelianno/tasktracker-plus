/*
  auth.js
  Express middleware for authentication in TaskTracker+ backend.
  - Verifies JWT tokens and attaches user info to requests.
  - Protects private routes from unauthorized access.
*/

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header or cookies
    let token = req.header('Authorization');
    
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }

      // Add user to request object
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = auth;