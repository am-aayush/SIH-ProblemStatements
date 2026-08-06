const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is Leader or CoLeader
const isLeaderOrCoLeader = (req, res, next) => {
  if (req.user.role !== 'Leader' && req.user.role !== 'CoLeader') {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

// @route   POST /api/meetings
// @desc    Create a meeting
router.post('/', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, meetingType, location, meetingLink, agenda, attendees } = req.body;

    const newMeeting = new Meeting({
      teamId: req.user.teamId,
      createdBy: req.user.userId,
      title,
      description,
      date,
      startTime,
      endTime,
      meetingType,
      location,
      meetingLink,
      agenda,
      attendees: attendees.map(userId => ({ userId, status: 'Pending' }))
    });

    const meeting = await newMeeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/meetings
// @desc    Get all team meetings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.find({ teamId: req.user.teamId })
      .populate('createdBy', 'fullName')
      .populate('attendees.userId', 'fullName avatar')
      .sort({ date: 1, startTime: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET /api/meetings/:id
// @desc    Get meeting details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'fullName')
      .populate('attendees.userId', 'fullName avatar role')
      .populate('actionItems.assignedMember', 'fullName avatar');
    
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/meetings/:id
// @desc    Update a meeting
router.put('/:id', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Updates
    const updatableFields = ['title', 'description', 'date', 'startTime', 'endTime', 'meetingType', 'location', 'meetingLink', 'agenda', 'status'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) meeting[field] = req.body[field];
    });

    if (req.body.attendees) {
      // Sync attendees without losing their status if they already exist
      const newAttendees = req.body.attendees.map(userId => {
        const existing = meeting.attendees.find(a => a.userId.toString() === userId.toString());
        return existing || { userId, status: 'Pending' };
      });
      meeting.attendees = newAttendees;
    }

    const updated = await meeting.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   DELETE /api/meetings/:id
// @desc    Delete a meeting
router.delete('/:id', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    await meeting.deleteOne();
    res.json({ message: 'Meeting removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/meetings/:id/attendance
// @desc    Update attendance status for a member
router.put('/:id/attendance', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const attendeeIndex = meeting.attendees.findIndex(a => a.userId.toString() === req.user.userId.toString());
    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'You are not invited to this meeting' });
    }

    meeting.attendees[attendeeIndex].status = status;
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   PUT /api/meetings/:id/notes
// @desc    Add meeting notes
router.put('/:id/notes', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.notes = req.body;
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST /api/meetings/:id/action-items
// @desc    Add an action item
router.post('/:id/action-items', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.actionItems.push(req.body);
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   POST /api/meetings/:id/action-items/:itemId/convert
// @desc    Convert an action item to a Task
router.post('/:id/action-items/:itemId/convert', authMiddleware, isLeaderOrCoLeader, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting || meeting.teamId.toString() !== req.user.teamId) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const actionItem = meeting.actionItems.id(req.params.itemId);
    if (!actionItem) return res.status(404).json({ message: 'Action item not found' });
    if (actionItem.status === 'Converted') return res.status(400).json({ message: 'Already converted' });

    // Create a new task
    const newTask = new Task({
      teamId: req.user.teamId,
      title: actionItem.title,
      description: actionItem.description + `\n\n(Generated from Meeting: ${meeting.title})`,
      assignedTo: actionItem.assignedMember,
      assignedBy: req.user.userId,
      deadline: actionItem.deadline,
      priority: 'Medium',
      status: 'Todo'
    });

    const savedTask = await newTask.save();

    // Update action item status
    actionItem.status = 'Converted';
    actionItem.taskId = savedTask._id;
    await meeting.save();

    res.json({ meeting, task: savedTask });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
