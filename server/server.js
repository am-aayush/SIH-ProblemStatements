const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes (will be created in next steps)
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const userRoutes = require('./routes/users');
const researchRoutes = require('./routes/research');
const taskRoutes = require('./routes/tasks');
const standupRoutes = require('./routes/standups');
const notificationRoutes = require('./routes/notifications');
const meetingRoutes = require('./routes/meetings');
const submissionRoutes = require('./routes/submissions');
const customProblemRoutes = require('./routes/customProblems');
const masterAuthRoutes = require('./routes/masterAuth');
const masterAnalyticsRoutes = require('./routes/masterAnalytics');

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/standups', standupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/resources', require('./routes/resources'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/custom-problems', customProblemRoutes);

// Master Admin Routes
app.use('/api/master/auth', masterAuthRoutes);
app.use('/api/master/analytics', masterAnalyticsRoutes);

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for SPA routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih2025';

console.log('Connecting to MongoDB database...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
