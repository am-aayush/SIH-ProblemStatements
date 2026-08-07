const express = require('express');
const Standup = require('../models/Standup');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Submit or update today's standup
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { yesterday, today, blockers } = req.body;
    
    // Normalize date to start of day (local time approx or UTC)
    const dateStr = new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    let standup = await Standup.findOne({
      teamId: req.user.teamId,
      userId: req.user.userId,
      date: date
    });

    if (standup) {
      standup.yesterday = yesterday;
      standup.today = today;
      standup.blockers = blockers;
      await standup.save();
    } else {
      standup = new Standup({
        teamId: req.user.teamId,
        userId: req.user.userId,
        date: date,
        yesterday,
        today,
        blockers
      });
      await standup.save();
    }
    
    const populated = await Standup.findById(standup._id).populate('userId', 'fullName role profile.avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get standups (default to today)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    const standups = await Standup.find({
      teamId: req.user.teamId,
      date: date
    }).populate('userId', 'fullName role profile.avatar');
    
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
