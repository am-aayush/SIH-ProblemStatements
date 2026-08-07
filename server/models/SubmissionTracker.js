const mongoose = require('mongoose');

const submissionTrackerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true,
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [{
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Blocked'],
      default: 'Not Started'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    deadline: {
      type: Date,
    },
    assignedMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notes: {
      type: String,
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('SubmissionTracker', submissionTrackerSchema);
