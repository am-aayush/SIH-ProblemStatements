const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Invitation = require('../models/Invitation');
const RefreshToken = require('../models/RefreshToken');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Leader Signup
router.post('/register-leader', async (req, res) => {
  try {
    const { fullName, email, password, teamName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const leader = new User({ fullName, email, password: hashedPassword, role: 'Leader' });
    await leader.save();

    const teamCode = generateInviteCode();
    const team = new Team({ teamName, uniqueTeamCode: teamCode, leader: leader._id });
    await team.save();

    leader.teamId = team._id;
    await leader.save();

    const token = jwt.sign({ userId: leader._id, role: leader.role, teamId: team._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: leader._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    await new RefreshToken({ token: refreshToken, userId: leader._id }).save();
    
    res.status(201).json({ token, refreshToken, user: { _id: leader._id, fullName, email, role: leader.role, teamId: team._id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join Team
router.post('/join-team', async (req, res) => {
  try {
    const { inviteCode, fullName, email, password } = req.body;

    const invitation = await Invitation.findOne({ inviteCode, used: false, expiresAt: { $gt: new Date() } });
    if (!invitation) return res.status(400).json({ message: 'Invalid or expired invite code' });

    const team = await Team.findById(invitation.teamId);
    if (!team) return res.status(400).json({ message: 'Team not found' });
    
    // Check if team is full by querying Users
    const memberCount = await User.countDocuments({ teamId: team._id });
    if (memberCount >= 6) return res.status(400).json({ message: 'Team is already full (max 6 members)' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = new User({ fullName, email, password: hashedPassword, role: 'Member', teamId: team._id });
    await member.save();

    invitation.used = true;
    await invitation.save();

    const token = jwt.sign({ userId: member._id, role: member.role, teamId: team._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: member._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    await new RefreshToken({ token: refreshToken, userId: member._id }).save();
    
    res.status(201).json({ token, refreshToken, user: { _id: member._id, fullName, email, role: member.role, teamId: team._id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role, teamId: user.teamId }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    await new RefreshToken({ token: refreshToken, userId: user._id }).save();
    
    res.json({ token, refreshToken, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, teamId: user.teamId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) return res.status(401).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        await RefreshToken.deleteOne({ token: refreshToken });
        return res.status(401).json({ message: 'Refresh token expired' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const newAccessToken = jwt.sign({ userId: user._id, role: user.role, teamId: user.teamId }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
