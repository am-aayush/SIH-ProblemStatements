const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['Leader', 'CoLeader', 'Member'], 
    default: 'Member' 
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  
  // Profile Fields
  profile: {
    bio: { type: String, default: '' },
    college: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: String, default: '' },
    preferredDomain: { type: String, default: '' },
    technologyStack: [{ type: String }],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' }
    }
  },
  
  // Skill Matrix Fields
  primarySkills: [{ type: String }],
  secondarySkills: [{ type: String }],
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    default: 'Beginner' 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
