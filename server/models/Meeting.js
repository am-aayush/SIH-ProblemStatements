const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  meetingType: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  },
  location: {
    type: String,
  },
  meetingLink: {
    type: String,
  },
  agenda: [{
    type: String
  }],
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Maybe', 'Pending'],
      default: 'Pending'
    }
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: {
    summary: String,
    importantDecisions: String,
    futureDiscussion: String
  },
  actionItems: [{
    title: String,
    description: String,
    assignedMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['Pending', 'Converted'],
      default: 'Pending'
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
