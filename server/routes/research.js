const express = require('express');
const router = express.Router();
const ProblemResearch = require('../models/ProblemResearch');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/authMiddleware');

// Get all research data for a team
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ message: 'User does not belong to a team' });
    }
    const research = await ProblemResearch.find({ teamId: req.user.teamId })
      .populate('notes.author', 'fullName avatar')
      .populate('resources.addedBy', 'fullName avatar');
    const votes = await Vote.find({ teamId: req.user.teamId });
    const comments = await Comment.find({ teamId: req.user.teamId }).populate('userId', 'fullName role avatar');
    
    res.json({ research, votes, comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle bookmark
router.post('/:problemId/bookmark', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    
    if (!research) {
      research = new ProblemResearch({
        problemStatementId: problemId,
        teamId: req.user.teamId,
        createdBy: req.user.userId,
        status: 'Bookmarked',
        bookmarkedBy: [req.user.userId]
      });
      await research.save();
    } else {
      const index = research.bookmarkedBy.indexOf(req.user.userId);
      if (index > -1) {
        research.bookmarkedBy.splice(index, 1);
        if (research.bookmarkedBy.length === 0 && research.status === 'Bookmarked') {
          research.status = 'Available';
        }
      } else {
        research.bookmarkedBy.push(req.user.userId);
        if (research.status === 'Available') {
          research.status = 'Bookmarked';
        }
      }
      await research.save();
    }
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Move pipeline stage
router.put('/:problemId/stage', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { status } = req.body;
    
    if (['Shortlisted', 'Final Selected'].includes(status)) {
       const team = await Team.findById(req.user.teamId);
       if (team.leader.toString() !== req.user.userId.toString() && team.coLeader?.toString() !== req.user.userId.toString()) {
         return res.status(403).json({ message: 'Only Leader or Co-Leader can move to this stage' });
       }
    }

    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) {
      research = new ProblemResearch({
        problemStatementId: problemId,
        teamId: req.user.teamId,
        createdBy: req.user.userId,
      });
    }
    
    research.status = status;
    await research.save();
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Notes
router.post('/:problemId/notes', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) {
      research = new ProblemResearch({ problemStatementId: problemId, teamId: req.user.teamId, createdBy: req.user.userId, status: 'Researching' });
    }
    research.notes.push({ content: req.body.content, author: req.user.userId });
    await research.save();
    
    // populate author before returning
    const populated = await ProblemResearch.findById(research._id).populate('notes.author', 'fullName avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:problemId/notes/:noteId', authMiddleware, async (req, res) => {
  try {
    const { problemId, noteId } = req.params;
    const research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) return res.status(404).json({ message: 'Research not found' });
    
    const note = research.notes.id(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    // Only author or leader can delete
    const team = await Team.findById(req.user.teamId);
    const isLeader = team.leader.toString() === req.user.userId.toString() || team.coLeader?.toString() === req.user.userId.toString();
    if (note.author.toString() !== req.user.userId.toString() && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    note.deleteOne();
    await research.save();
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Resources
router.post('/:problemId/resources', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) {
      research = new ProblemResearch({ problemStatementId: problemId, teamId: req.user.teamId, createdBy: req.user.userId, status: 'Researching' });
    }
    
    research.resources.push({
      title: req.body.title,
      url: req.body.url,
      description: req.body.description,
      category: req.body.category,
      addedBy: req.user.userId
    });
    await research.save();
    
    const populated = await ProblemResearch.findById(research._id).populate('resources.addedBy', 'fullName avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:problemId/resources/:resourceId', authMiddleware, async (req, res) => {
  try {
    const { problemId, resourceId } = req.params;
    const research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) return res.status(404).json({ message: 'Research not found' });
    
    const resource = research.resources.id(resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    
    const team = await Team.findById(req.user.teamId);
    const isLeader = team.leader.toString() === req.user.userId.toString() || team.coLeader?.toString() === req.user.userId.toString();
    if (resource.addedBy.toString() !== req.user.userId.toString() && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    resource.deleteOne();
    await research.save();
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Tech Stack
router.put('/:problemId/techstack', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) {
      research = new ProblemResearch({ problemStatementId: problemId, teamId: req.user.teamId, createdBy: req.user.userId, status: 'Researching' });
    }
    
    research.techStack = req.body.techStack;
    await research.save();
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Finalize problem
router.post('/:problemId/finalize', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    const team = await Team.findById(req.user.teamId);
    
    if (team.leader.toString() !== req.user.userId.toString() && team.coLeader?.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only Leader or Co-Leader can finalize a problem' });
    }

    team.selectedProblem = problemId;
    await team.save();

    let research = await ProblemResearch.findOne({ problemStatementId: problemId, teamId: req.user.teamId });
    if (!research) {
      research = new ProblemResearch({
        problemStatementId: problemId,
        teamId: req.user.teamId,
        createdBy: req.user.userId,
      });
    }
    research.status = 'Final Selected';
    research.isFinalSelected = true;
    await research.save();

    await ProblemResearch.updateMany(
      { teamId: req.user.teamId, problemStatementId: { $ne: problemId } },
      { $set: { isFinalSelected: false } }
    );

    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Comments
router.post('/:problemId/comments', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { message } = req.body;
    const comment = new Comment({
      problemStatementId: problemId,
      teamId: req.user.teamId,
      userId: req.user.userId,
      message
    });
    await comment.save();
    
    const populated = await Comment.findById(comment._id).populate('userId', 'fullName role avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:problemId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, userId: req.user.userId });
    if (!comment) return res.status(404).json({ message: 'Comment not found or unauthorized' });
    
    comment.message = req.body.message;
    await comment.save();
    const populated = await Comment.findById(comment._id).populate('userId', 'fullName role avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:problemId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    const team = await Team.findById(req.user.teamId);
    const isLeader = team.leader.toString() === req.user.userId.toString();
    
    if (comment.userId.toString() !== req.user.userId.toString() && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Voting
router.post('/:problemId/votes', authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { rating } = req.body;
    
    let vote = await Vote.findOne({ problemStatementId: problemId, teamId: req.user.teamId, userId: req.user.userId });
    if (vote) {
      vote.vote = rating;
      await vote.save();
    } else {
      vote = new Vote({
        problemStatementId: problemId,
        teamId: req.user.teamId,
        userId: req.user.userId,
        vote: rating
      });
      await vote.save();
    }
    res.json(vote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
