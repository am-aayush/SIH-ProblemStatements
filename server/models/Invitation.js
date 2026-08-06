const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
