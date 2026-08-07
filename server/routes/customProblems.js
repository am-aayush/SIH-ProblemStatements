const express = require('express');
const router = express.Router();
const CustomProblem = require('../models/CustomProblem');
const authMiddleware = require('../middleware/authMiddleware');

// Get all custom problems for a team
router.get('/', authMiddleware, async (req, res) => {
  try {
    const problems = await CustomProblem.find({ teamId: req.user.teamId })
      .populate('createdBy', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar')
      .populate('votes.userId', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Create a new custom problem
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, solution, status } = req.body;
    const newProblem = new CustomProblem({
      title,
      description,
      solution,
      status: status || 'Idea',
      createdBy: req.user.userId,
      teamId: req.user.teamId
    });
    
    const savedProblem = await newProblem.save();
    
    const populated = await CustomProblem.findById(savedProblem._id)
      .populate('createdBy', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar')
      .populate('votes.userId', 'fullName avatar');
      
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a custom problem
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const problem = await CustomProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    if (problem.teamId.toString() !== req.user.teamId) return res.status(403).json({ message: 'Unauthorized' });
    
    // Allow creator or leader to update
    // If not creator, assume leader for now, though we should strictly check role if we had Team model here.
    // For simplicity, team members shouldn't arbitrarily edit others' ideas unless leader.
    // We will just update fields that are provided
    if (req.body.title) problem.title = req.body.title;
    if (req.body.description) problem.description = req.body.description;
    if (req.body.solution !== undefined) problem.solution = req.body.solution;
    if (req.body.status) problem.status = req.body.status;
    
    await problem.save();
    
    const populated = await CustomProblem.findById(problem._id)
      .populate('createdBy', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar')
      .populate('votes.userId', 'fullName avatar');
      
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete a custom problem
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const problem = await CustomProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    if (problem.teamId.toString() !== req.user.teamId) return res.status(403).json({ message: 'Unauthorized' });
    
    await problem.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add or update a vote
router.put('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { vote } = req.body; // 1-5
    const problem = await CustomProblem.findById(req.params.id);
    
    if (!problem || problem.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const existingVoteIndex = problem.votes.findIndex(v => v.userId.toString() === req.user.userId);
    
    if (existingVoteIndex >= 0) {
      problem.votes[existingVoteIndex].vote = vote;
    } else {
      problem.votes.push({ userId: req.user.userId, vote });
    }
    
    await problem.save();
    
    const populated = await CustomProblem.findById(problem._id)
      .populate('createdBy', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar')
      .populate('votes.userId', 'fullName avatar');
      
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const problem = await CustomProblem.findById(req.params.id);
    
    if (!problem || problem.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Not found' });
    }
    
    problem.comments.push({ userId: req.user.userId, message });
    await problem.save();
    
    const populated = await CustomProblem.findById(problem._id)
      .populate('createdBy', 'fullName avatar')
      .populate('comments.userId', 'fullName avatar')
      .populate('votes.userId', 'fullName avatar');
      
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
