const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  uniqueTeamCode: { type: String, required: true, unique: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  selectedProblem: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
