const User = require('../models/User');
const PhoneOTP = require('../models/PhoneOTP');
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

const OTP_EXPIRY_MINUTES = 5;

const normalizePhone = (value = '') => value.replace(/\D/g, '').slice(-10);

const isOtpExpired = (expiresAt) => new Date(expiresAt).getTime() <= Date.now();

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedPhone = normalizePhone(phone || '');

    if (!normalizedPhone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const phoneVerification = await PhoneOTP.findOne({ phone: normalizedPhone });
    if (!phoneVerification || !phoneVerification.verified || isOtpExpired(phoneVerification.expiresAt)) {
      return res.status(400).json({ message: 'Please verify your phone number before signing up' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      password,
      emailVerified: true, // Always true now
      role: 'user',
    });

    await PhoneOTP.deleteOne({ phone: normalizedPhone });

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

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  try {
    const normalizedPhone = normalizePhone(req.body.phone || '');

    if (!normalizedPhone || normalizedPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await PhoneOTP.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        phone: normalizedPhone,
        otp,
        verified: false,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`\n📱 OTP for ${normalizedPhone}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);
    console.log(`⏰ Generated at: ${new Date().toLocaleTimeString()}`);
    console.log(`⌛ Expires at: ${expiresAt.toLocaleTimeString()}\n`);

    const payload = {
      message: 'OTP sent successfully',
      phone: normalizedPhone,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.otp = otp;
    }

    res.status(200).json(payload);

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const normalizedPhone = normalizePhone(req.body.phone || '');
    const otp = String(req.body.otp || '').trim();

    if (!normalizedPhone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const storedOTP = await PhoneOTP.findOne({ phone: normalizedPhone });
    if (!storedOTP) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    if (isOtpExpired(storedOTP.expiresAt)) {
      await PhoneOTP.deleteOne({ phone: normalizedPhone });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    storedOTP.verified = true;
    await storedOTP.save();

    console.log(`✅ OTP verified for ${normalizedPhone}`);

    res.status(200).json({
      message: 'OTP verified successfully',
      phone: normalizedPhone,
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
    const normalizedPhone = normalizePhone(String(req.query.phone || ''));

    if (!normalizedPhone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const otpData = await PhoneOTP.findOne({ phone: normalizedPhone });
    const isVerified = Boolean(otpData && otpData.verified === true && !isOtpExpired(otpData.expiresAt));

    res.status(200).json({
      phone: normalizedPhone,
      verified: isVerified
    });

  } catch (error) {
    console.error('Check Phone Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};
