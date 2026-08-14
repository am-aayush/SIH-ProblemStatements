const express = require('express');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const MasterOTP = require('../models/MasterOTP');

const router = express.Router();

// Only initialize Resend if the key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The configured master admin email from environment variables
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL;
const MASTER_ADMIN_JWT_SECRET = process.env.MASTER_ADMIN_JWT_SECRET || 'master_fallback_secret';

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!MASTER_ADMIN_EMAIL) {
      return res.status(500).json({ message: 'Master Admin Email is not configured on the server.' });
    }

    // Generic response regardless of whether the email is correct to prevent enumeration
    if (email !== MASTER_ADMIN_EMAIL) {
      // Simulate slight delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.json({ message: 'If the email is authorized, an OTP has been sent.' });
    }

    // Rate limiting: Check if an OTP was requested very recently
    const recentOTP = await MasterOTP.findOne({ email }).sort({ createdAt: -1 });
    if (recentOTP && (Date.now() - recentOTP.createdAt.getTime() < 30000)) {
      // Wait 30 seconds before allowing another request
      return res.json({ message: 'If the email is authorized, an OTP has been sent.' });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (it will auto-expire based on TTL)
    await MasterOTP.deleteMany({ email }); // clear previous ones
    await new MasterOTP({ email, otp }).save();

    // Send via Resend
    if (resend) {
      await resend.emails.send({
        from: 'SIH Platform <onboarding@resend.dev>', // Update with a verified domain in production
        to: email,
        subject: 'Master Admin Login OTP',
        html: `<p>Your Master Admin login OTP is: <strong>${otp}</strong></p><p>This code expires in 5 minutes.</p>`
      });
    } else {
      console.warn('RESEND_API_KEY is not set. OTP for Master Admin is:', otp);
    }

    res.json({ message: 'If the email is authorized, an OTP has been sent.' });
  } catch (error) {
    console.error('OTP Request Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (email !== MASTER_ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid OTP or Email' });
    }

    const storedOTP = await MasterOTP.findOne({ email, otp });
    
    if (!storedOTP) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Delete the OTP so it can only be used once
    await MasterOTP.deleteMany({ email });

    // Generate Master Admin JWT
    const token = jwt.sign(
      { email, role: 'MasterAdmin' }, 
      MASTER_ADMIN_JWT_SECRET, 
      { expiresIn: '12h' } // Master admin session lasts 12 hours
    );

    res.json({ token, message: 'Authenticated successfully' });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
