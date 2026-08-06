const mongoose = require('mongoose');

const standupSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // Usually stored as start of day for simple querying
  yesterday: { type: String, required: true },
  today: { type: String, required: true },
  blockers: { type: String, default: '' },
}, { timestamps: true });

// Ensure one standup per user per day per team
standupSchema.index({ teamId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Standup', standupSchema);
