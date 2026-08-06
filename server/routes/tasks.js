const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const isLeaderOrCoLeader = async (userId, teamId) => {
  const team = await Team.findById(teamId);
  if (!team) return false;
  return team.leader.toString() === userId.toString() || team.coLeader?.toString() === userId.toString();
};

const createNotification = async (userId, teamId, message, type, link) => {
  await new Notification({ userId, teamId, message, type, link }).save();
};

// Create a task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const isLeader = await isLeaderOrCoLeader(req.user.userId, req.user.teamId);
    if (!isLeader) return res.status(403).json({ message: 'Only Leader or Co-Leader can create tasks' });

    const task = new Task({
      ...req.body,
      teamId: req.user.teamId,
      assignedBy: req.user.userId
    });
    await task.save();

    if (task.assignedTo && task.assignedTo.toString() !== req.user.userId.toString()) {
      await createNotification(task.assignedTo, req.user.teamId, `You have been assigned a new task: ${task.title}`, 'TaskAssigned', `/tasks`);
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for the team
router.get('/', authMiddleware, async (req, res) => {
  try {
    let filter = { teamId: req.user.teamId };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'fullName email profile.avatar')
      .populate('assignedBy', 'fullName');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.teamId.toString() !== req.user.teamId.toString()) return res.status(403).json({ message: 'Unauthorized' });

    const isLeader = await isLeaderOrCoLeader(req.user.userId, req.user.teamId);
    const isAssignee = task.assignedTo?.toString() === req.user.userId.toString();

    // Leaders can edit anything. Assignees can only edit status, progress, actualHours.
    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: 'Unauthorized to edit this task' });
    }

    if (isLeader) {
      // Leader can update everything
      Object.assign(task, req.body);
    } else {
      // Assignee can only update progress-related fields
      if (req.body.status !== undefined) task.status = req.body.status;
      if (req.body.completionPercentage !== undefined) task.completionPercentage = req.body.completionPercentage;
      if (req.body.actualHours !== undefined) task.actualHours = req.body.actualHours;
    }

    await task.save();

    // If status changed and user is assignee, notify leader? Or if leader updated and assigned to member, notify member
    if (isLeader && task.assignedTo && task.assignedTo.toString() !== req.user.userId.toString()) {
      await createNotification(task.assignedTo, req.user.teamId, `Task updated: ${task.title}`, 'TaskUpdated', `/tasks`);
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName email profile.avatar')
      .populate('assignedBy', 'fullName');
      
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.teamId.toString() !== req.user.teamId.toString()) return res.status(403).json({ message: 'Unauthorized' });

    const isLeader = await isLeaderOrCoLeader(req.user.userId, req.user.teamId);
    if (!isLeader) {
      return res.status(403).json({ message: 'Only Leader or Co-Leader can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
