/*
  auth.js
  Express router for authentication endpoints in TaskTracker+ backend.
  - Handles registration, login, profile, password, and user preferences.
  - Secures routes with authentication middleware.
  - Delegates logic to auth-related controllers.
*/

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Email service (simulation - in production use NodeMailer, SendGrid, etc.)
const sendEmail = async (to, subject, html) => {
  // Simulate email sending
  
  // In production, use a real email service:
  // const transporter = nodemailer.createTransporter({...});
  // await transporter.sendMail({ to, subject, html });
  
  return { success: true };
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user || user.isDeleted) {
        return res.status(401).json({
          success: false,
          message: user && user.isDeleted ? 'Account has been deleted. Please contact support if this is an error.' : 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last active
      user.lastActive = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences
        },
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('currentPassword').optional(),
  body('newPassword').optional().isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { name, email, currentPassword, newPassword } = req.body;

      // Find user and include password for comparison if changing password
      const user = await User.findById(userId).select(newPassword ? '+password' : '');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken'
          });
        }
      }

      // Update basic info
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change password'
          });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        // Update password
        user.password = newPassword;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastActive: user.lastActive,
          createdAt: user.createdAt,
          preferences: user.preferences
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating profile'
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash token and set expiry (10 minutes)
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      await user.save();

      // Create reset URL (in production, use your frontend URL)
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

      // Email template
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TaskTracker+</h1>
            <p style="color: #bfdbfe; margin: 5px 0 0 0;">Enterprise Edition</p>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #64748b; line-height: 1.6;">
              We received a request to reset your password for your TaskTracker+ account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
            </p>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              If the button above doesn't work, copy and paste this URL into your browser:<br>
              <span style="color: #2563eb; word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
          <div style="padding: 20px; background: #e5e7eb; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © TaskTracker+ Enterprise Edition. Secure task management for professionals.
            </p>
          </div>
        </div>
      `;

      // Send email
      await sendEmail(user.email, 'Reset Your TaskTracker+ Password', emailHtml);

      res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error processing request'
      });
    }
  }
);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token',
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Password requirements not met',
          errors: errors.array()
        });
      }

      const { token } = req.params;
      const { password } = req.body;

      // Hash the token to compare with database
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token that hasn't expired
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      }).select('+resetPasswordToken +resetPasswordExpires');

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset fields
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();

      // Generate new login token
      const loginToken = generateToken(user._id);

      res.json({
        success: true,
        message: 'Password reset successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: loginToken
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error resetting password'
      });
    }
  }
);

module.exports = router;