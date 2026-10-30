const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getStatus } = require('../config/db');
const { sendOtpEmail } = require('../services/emailService');
const { memoryUsers } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_avatarapp_2026';

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * Register User
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, mobile number, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check existing user
    if (getStatus()) {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { mobile: cleanMobile }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === cleanEmail
            ? 'An account with this email already exists.'
            : 'An account with this mobile number already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        mobile: cleanMobile,
        email: cleanEmail,
        password: hashedPassword,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        }
      });
    } else {
      // Memory fallback
      const existing = memoryUsers.find(u => u.email === cleanEmail || u.mobile === cleanMobile);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email or mobile already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user-' + Date.now(),
        name: name.trim(),
        mobile: cleanMobile,
        email: cleanEmail,
        password: hashedPassword,
        createdAt: new Date(),
      };
      memoryUsers.push(newUser);

      const token = generateToken(newUser._id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! (Local storage mode)',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile: newUser.mobile,
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/mobile and password.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    let user;
    if (getStatus()) {
      user = await User.findOne({
        $or: [
          { email: cleanIdentifier },
          { mobile: identifier.trim() }
        ]
      });
    } else {
      user = memoryUsers.find(u =>
        u.email === cleanIdentifier || u.mobile === identifier.trim()
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

/**
 * Forgot Password - Send OTP via SMTP
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user;
    if (getStatus()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.'
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (getStatus()) {
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = expires;
      await user.save();
    } else {
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = expires;
    }

    // Send OTP via email
    const emailResult = await sendOtpEmail(cleanEmail, otp, user.name);

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      devMode: emailResult.devMode,
      ...(emailResult.debugOtp && { debugOtp: emailResult.debugOtp }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process forgot password request.'
    });
  }
};

/**
 * Reset Password using OTP
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, 6-digit OTP, and your new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    let user;
    if (getStatus()) {
      user = await User.findOne({
        email: cleanEmail,
        resetPasswordOtp: cleanOtp,
        resetPasswordExpires: { $gt: Date.now() }
      });
    } else {
      user = memoryUsers.find(u =>
        u.email === cleanEmail &&
        u.resetPasswordOtp === cleanOtp &&
        new Date(u.resetPasswordExpires) > new Date()
      );
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (getStatus()) {
      user.password = hashedPassword;
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
    } else {
      user.password = hashedPassword;
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.'
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

