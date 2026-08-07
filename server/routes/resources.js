const express = require('express');
const router = express.Router();
const TeamResource = require('../models/TeamResource');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is Leader or CoLeader
const isLeaderOrCoLeader = async (req, res, next) => {
  if (req.user.role !== 'Leader' && req.user.role !== 'CoLeader') {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

// @route   GET /api/resources
// @desc    Get all resources for the team
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resources = await TeamResource.find({ teamId: req.user.teamId })
      .populate('createdBy', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST /api/resources
// @desc    Add a team resource
router.post('/', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const newResource = new TeamResource({
      teamId: req.user.teamId,
      createdBy: req.user.userId,
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      category: req.body.category
    });

    const saved = await newResource.save();
    const populated = await TeamResource.findById(saved._id).populate('createdBy', 'fullName avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
router.put('/:id', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const resource = await TeamResource.findById(req.params.id);
    if (!resource || resource.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { title, description, url, category } = req.body;
    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (url) resource.url = url;
    if (category) resource.category = category;

    const saved = await resource.save();
    const populated = await TeamResource.findById(saved._id).populate('createdBy', 'fullName avatar');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete a resource
router.delete('/:id', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const resource = await TeamResource.findById(req.params.id);
    if (!resource || resource.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
