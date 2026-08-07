const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const ProblemResearch = require('../models/ProblemResearch');
const SubmissionTracker = require('../models/SubmissionTracker');
const Vote = require('../models/Vote');

// @route   GET /api/analytics
// @desc    Get team analytics dashboard data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const teamIdStr = req.user.teamId;
    if (!teamIdStr) return res.status(400).json({ message: 'No team found for user' });

    const teamId = new mongoose.Types.ObjectId(teamIdStr);

    // 1. Team Overview
    const membersCount = await User.countDocuments({ teamId: teamIdStr });
    const tasksCount = await Task.countDocuments({ teamId: teamIdStr });
    const tasksCompleted = await Task.countDocuments({ teamId: teamIdStr, status: 'Completed' });
    const tasksPending = tasksCount - tasksCompleted;
    const meetingsCompleted = await Meeting.countDocuments({ teamId: teamIdStr, status: 'Completed' });

    // 2. Member Contributions (Tasks by Member)
    const members = await User.find({ teamId: teamIdStr }, 'fullName name');
    const taskAggregation = await Task.aggregate([
      { $match: { teamId: teamId, status: 'Completed' } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);
    
    const memberContributions = members.map(m => {
      const taskAggr = taskAggregation.find(t => t._id && t._id.toString() === m._id.toString());
      return {
        name: m.fullName || m.name || 'Unknown',
        tasksCompleted: taskAggr ? taskAggr.count : 0
      };
    });

    // 3. Idea Analytics
    const researchedProblemsCount = await ProblemResearch.countDocuments({ teamId: teamIdStr });
    const shortlistedCount = await ProblemResearch.countDocuments({ teamId: teamIdStr, status: 'Shortlisted' });
    
    // 4. Submission Analytics
    const submission = await SubmissionTracker.findOne({ teamId: teamIdStr });
    const milestones = submission ? submission.milestones : [];
    const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
    const submissionProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

    res.json({
      overview: {
        totalMembers: membersCount,
        tasksCompleted,
        tasksPending,
        meetingsCompleted,
        submissionProgress: Math.round(submissionProgress),
        researchProgress: researchedProblemsCount
      },
      memberContributions,
      ideaAnalytics: {
        totalResearched: researchedProblemsCount,
        shortlisted: shortlistedCount,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
