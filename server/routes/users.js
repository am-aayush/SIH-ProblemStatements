const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Search and Filter members inside the same team
router.get('/team/search', authMiddleware, async (req, res) => {
  try {
    const { skill, experience, domain } = req.query;
    
    let query = { teamId: req.user.teamId };
    
    if (skill) {
      query.$or = [
        { primarySkills: { $regex: skill, $options: 'i' } },
        { secondarySkills: { $regex: skill, $options: 'i' } }
      ];
    }
    
    if (experience) {
      query.experienceLevel = experience;
    }

    if (domain) {
      query['profile.preferredDomain'] = { $regex: domain, $options: 'i' };
    }

    const members = await User.find(query).select('-password');
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if the user is in the same team or self
    if (user.teamId && user.teamId.toString() !== req.user.teamId && user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile & Skills (Self only)
router.put('/:id/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { profile, primarySkills, secondarySkills, experienceLevel, avatar } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (profile) user.profile = { ...user.profile, ...profile };
    if (primarySkills) user.primarySkills = primarySkills;
    if (secondarySkills) user.secondarySkills = secondarySkills;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
