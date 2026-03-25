const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  location: user.location,
  role: user.role,
  emailVerified: user.emailVerified,
});

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      emailVerified: true, // Always true now
      role: 'user',
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: serializeUser(user),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: serializeUser(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;

      if (req.body.email) {
        return res.status(400).json({ message: 'Email cannot be changed' });
      }

      const updatedUser = await user.save();

      res.json({
        token: generateToken(updatedUser._id),
        user: serializeUser(updatedUser),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // For now, just a stub
    res.json({ message: 'Email verified successfully (Mock)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESEND VERIFICATION =================
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    // For now, just a stub
    res.json({ message: 'Verification email resent (Mock)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= OTP STORAGE (IN-MEMORY) =================
// Format: { phoneNumber: { otp: '123456', timestamp: Date, verified: false } }
const otpStorage = {};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isOTPExpired = (timestamp, expiryMinutes = 5) => {
  const now = new Date();
  const diff = (now - new Date(timestamp)) / (1000 * 60); // in minutes
  return diff > expiryMinutes;
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp
    otpStorage[phone] = {
      otp,
      timestamp: new Date(),
      verified: false
    };

    // Log OTP for demo purposes
    console.log(`\n📱 OTP for ${phone}: ${otp} (expires in 5 minutes)`);
    console.log(`⏰ Generated at: ${new Date().toLocaleTimeString()}\n`);

    res.status(200).json({
      message: 'OTP sent successfully',
      phone, // Return phone for confirmation
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Check if OTP exists
    const storedOTP = otpStorage[phone];
    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (isOTPExpired(storedOTP.timestamp)) {
      delete otpStorage[phone];
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check if OTP matches
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified
    otpStorage[phone].verified = true;

    console.log(`✅ OTP verified for ${phone}`);

    res.status(200).json({
      message: 'OTP verified successfully',
      phone,
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify OTP' });
  }
};

// ================= CHECK PHONE VERIFICATION STATUS =================
exports.checkPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const otpData = otpStorage[phone];
    const isVerified = otpData && otpData.verified === true;

    res.status(200).json({
      phone,
      verified: isVerified
    });

  } catch (error) {
    console.error('Check Phone Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};
