const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Review', 'Completed', 'Blocked'], default: 'Todo' },
  deadline: { type: Date },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  labels: [{ type: String }],
  attachments: [{ type: String }], // URLs to attachments
  problemStatementId: { type: Number }, // Optional link to research problem
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
