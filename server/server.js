/*
  server.js
  Backend entry point for the TaskTracker+ application.
  - Sets up Express server, middleware, CORS, security, and rate limiting.
  - Connects to MongoDB using Mongoose.
  - Registers API routes for authentication, tasks, teams, and users.
  - Handles global error and 404 responses.
  - Only logs MongoDB connection in non-production environments.
*/

// Import core modules and middleware
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Security HTTP headers
app.use(helmet());
// CORS configuration: allow localhost origins and credentials for dev
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use('/api/', limiter);

// Body parsing and cookie handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktracker')
  .then(() => {
    // Log connection only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected successfully');
    }
  })
  .catch(err => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MongoDB connection error:', err);
    }
  });

// Register API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // No log here for production cleanliness
});