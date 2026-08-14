const express = require('express');
const mongoose = require('mongoose');
const masterAuthMiddleware = require('../middleware/masterAuthMiddleware');

const User = require('../models/User');
const Team = require('../models/Team');
const ProblemResearch = require('../models/ProblemResearch');
const Task = require('../models/Task');

const router = express.Router();

// Apply the strictly read-only master middleware to all routes in this file
router.use(masterAuthMiddleware);

// 1. Overview KPIs
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalLeaders = await User.countDocuments({ role: 'Leader' });
    const totalIdeas = await ProblemResearch.countDocuments();
    const totalTasks = await Task.countDocuments();

    res.json({
      totalUsers,
      totalTeams,
      totalLeaders,
      totalIdeas,
      totalTasks
    });
  } catch (error) {
    console.error('Master Analytics Overview Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Teams Explorer (List all teams with member counts)
router.get('/teams', async (req, res) => {
  try {
    // We use aggregation to count members efficiently
    const teams = await Team.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'teamId',
          as: 'members'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leader',
          foreignField: '_id',
          as: 'leaderInfo'
        }
      },
      {
        $project: {
          teamName: 1,
          uniqueTeamCode: 1,
          createdAt: 1,
          leaderName: { $arrayElemAt: ['$leaderInfo.fullName', 0] },
          leaderEmail: { $arrayElemAt: ['$leaderInfo.email', 0] },
          memberCount: { $size: '$members' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(teams);
  } catch (error) {
    console.error('Master Analytics Teams Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Team Details (Hierarchy: Team -> Leader -> Members & Ideas)
router.get('/teams/:id', async (req, res) => {
  try {
    const teamId = new mongoose.Types.ObjectId(req.params.id);

    // Fetch team info
    const team = await Team.findById(teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Fetch all members in this team
    const members = await User.find({ teamId }).select('-password').lean();

    // Organize members
    const leader = members.find(m => m.role === 'Leader');
    const coLeader = members.find(m => m.role === 'CoLeader');
    const regularMembers = members.filter(m => m.role === 'Member');

    // Fetch all Problem Research (Ideas) for this team
    const ideas = await ProblemResearch.find({ teamId })
      .populate('createdBy', 'fullName email')
      .populate('bookmarkedBy', 'fullName email')
      .lean();

    // Format the response securely
    res.json({
      teamInfo: {
        _id: team._id,
        name: team.teamName,
        code: team.uniqueTeamCode,
        createdAt: team.createdAt
      },
      hierarchy: {
        leader,
        coLeader,
        members: regularMembers
      },
      ideas: ideas.map(idea => ({
        _id: idea._id,
        problemStatementId: idea.problemStatementId,
        status: idea.status,
        createdBy: idea.createdBy?.fullName || 'Unknown',
        bookmarkedBy: idea.bookmarkedBy.map(b => b.fullName),
        resourcesCount: idea.resources?.length || 0,
        notesCount: idea.notes?.length || 0
      }))
    });
  } catch (error) {
    console.error('Master Analytics Team Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
