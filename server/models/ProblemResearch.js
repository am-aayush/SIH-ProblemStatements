const mongoose = require('mongoose');

const problemResearchSchema = new mongoose.Schema({
  problemStatementId: { type: Number, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Bookmarked', 'Researching', 'Voting', 'Shortlisted', 'Final Selected'], 
    default: 'Available' 
  },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notes: [{
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  resources: [{
    title: String,
    url: String,
    description: String,
    category: { type: String, enum: ['Dataset', 'GitHub', 'Documentation', 'Research Paper', 'Video', 'Website'], default: 'Website' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  techStack: [{
    category: String, // Frontend, Backend, Database, AI/ML, Cloud, Libraries, APIs
    name: String
  }],
  isFinalSelected: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure one research workspace per problem per team
problemResearchSchema.index({ problemStatementId: 1, teamId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemResearch', problemResearchSchema);
