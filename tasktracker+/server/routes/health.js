/*
  health.js
  Express router for health check endpoint in TaskTracker+ backend.
  - Provides a simple endpoint to verify server status and uptime.
  - Used for monitoring and deployment health checks.
*/

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;