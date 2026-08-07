const express = require('express');
const router = express.Router();
const SubmissionTracker = require('../models/SubmissionTracker');
const authMiddleware = require('../middleware/authMiddleware');

const MILESTONES = [
  'Problem Finalized',
  'Research Completed',
  'Solution Design',
  'Prototype Development',
  'Testing',
  'Documentation',
  'PPT Preparation',
  'Demo Video',
  'Final Submission'
];

// @route   GET /api/submissions
// @desc    Get team submission tracker (create if doesn't exist)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let tracker = await SubmissionTracker.findOne({ teamId: req.user.teamId })
      .populate('milestones.assignedMembers', 'fullName avatar');
    
    if (!tracker) {
      const milestones = MILESTONES.map(name => ({
        name,
        status: 'Not Started',
        progress: 0
      }));

      tracker = new SubmissionTracker({
        teamId: req.user.teamId,
        milestones,
        overallProgress: 0
      });
      await tracker.save();
      // populate it
      tracker = await SubmissionTracker.findOne({ teamId: req.user.teamId })
        .populate('milestones.assignedMembers', 'fullName avatar');
    }
    
    res.json(tracker);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Middleware to check if user is Leader or CoLeader
const isLeaderOrCoLeader = (req, res, next) => {
  if (req.user.role !== 'Leader' && req.user.role !== 'CoLeader') {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

// @route   PUT /api/submissions/milestone/:milestoneId
// @desc    Update a milestone (Leaders can update all, members can update progress/notes if assigned)
router.put('/milestone/:milestoneId', authMiddleware, async (req, res) => {
  try {
    const tracker = await SubmissionTracker.findOne({ teamId: req.user.teamId });
    if (!tracker) return res.status(404).json({ message: 'Tracker not found' });

    const milestone = tracker.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    const isLeader = req.user.role === 'Leader' || req.user.role === 'CoLeader';
    const isAssigned = milestone.assignedMembers.some(id => id.toString() === req.user.userId.toString());

    if (!isLeader && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this milestone' });
    }

    if (isLeader) {
      if (req.body.status !== undefined) milestone.status = req.body.status;
      if (req.body.deadline !== undefined) milestone.deadline = req.body.deadline;
    }
    
    if (req.body.progress !== undefined) milestone.progress = req.body.progress;
    if (req.body.notes !== undefined) milestone.notes = req.body.notes;

    // Recalculate overall progress
    const totalProgress = tracker.milestones.reduce((sum, m) => sum + m.progress, 0);
    tracker.overallProgress = Math.round(totalProgress / tracker.milestones.length);

    await tracker.save();

    // Populate and return
    const populatedTracker = await SubmissionTracker.findById(tracker._id)
      .populate('milestones.assignedMembers', 'fullName avatar');
    
    res.json(populatedTracker);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/submissions/milestone/:milestoneId/assign
// @desc    Assign members to a milestone
router.put('/milestone/:milestoneId/assign', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const tracker = await SubmissionTracker.findOne({ teamId: req.user.teamId });
    if (!tracker) return res.status(404).json({ message: 'Tracker not found' });

    const milestone = tracker.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.assignedMembers = req.body.assignedMembers;
    await tracker.save();

    const populatedTracker = await SubmissionTracker.findById(tracker._id)
      .populate('milestones.assignedMembers', 'fullName avatar');

    res.json(populatedTracker);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
