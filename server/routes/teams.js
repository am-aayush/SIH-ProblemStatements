const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Generate invite link (Leader only)
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Leader') {
      return res.status(403).json({ message: 'Only leaders can generate invites' });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    const memberCount = await User.countDocuments({ teamId: team._id });
    if (memberCount >= 6) return res.status(400).json({ message: 'Team is full (max 6 members)' });

    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const invitation = new Invitation({
      inviteCode,
      teamId: team._id,
      expiresAt
    });
    await invitation.save();

    res.json({ inviteCode, expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manage member role (Promote, Demote, Remove) (Leader only)
router.put('/:id/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { action } = req.body; // 'promote', 'demote', 'remove'

    if (req.user.role !== 'Leader' || req.user.teamId !== id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.userId === memberId) {
      return res.status(400).json({ message: 'Cannot manage yourself' });
    }

    const team = await Team.findById(id);
    const member = await User.findById(memberId);

    if (!team || !member || member.teamId.toString() !== id) {
      return res.status(404).json({ message: 'Team or Member not found' });
    }

    if (action === 'promote') {
      if (team.coLeader) {
        return res.status(400).json({ message: 'Team already has a Co-Leader' });
      }
      member.role = 'CoLeader';
      team.coLeader = member._id;
    } else if (action === 'demote') {
      if (team.coLeader && team.coLeader.toString() === memberId) {
        member.role = 'Member';
        team.coLeader = null;
      }
    } else if (action === 'remove') {
      member.teamId = null;
      member.role = 'Member'; // Reset role
      if (team.coLeader && team.coLeader.toString() === memberId) {
        team.coLeader = null;
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await member.save();
    await team.save();

    res.json({ message: `Member successfully ${action}d` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.teamId !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this team' });
    }

    const team = await Team.findById(req.params.id)
      .populate('leader', 'fullName email avatar role')
      .populate('coLeader', 'fullName email avatar role');

    if (!team) return res.status(404).json({ message: 'Team not found' });

    const members = await User.find({ teamId: team._id }).select('-password');
    const teamData = team.toObject();
    teamData.members = members;

    res.json(teamData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rename team
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { teamName } = req.body;
    if (req.user.role !== 'Leader' || req.user.teamId !== req.params.id) {
      return res.status(403).json({ message: 'Only leaders can rename the team' });
    }

    const team = await Team.findByIdAndUpdate(req.params.id, { teamName }, { new: true });
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
