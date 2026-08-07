const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // The recipient
  message: { type: String, required: true },
  type: { type: String, enum: ['TaskAssigned', 'TaskUpdated', 'TaskOverdue', 'ResearchAssigned', 'RoleChanged', 'MemberJoined', 'General'], default: 'General' },
  read: { type: Boolean, default: false },
  link: { type: String }, // Optional path to redirect when clicked
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
