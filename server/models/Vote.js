const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  problemStatementId: { type: Number, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vote: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

voteSchema.index({ problemStatementId: 1, teamId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
