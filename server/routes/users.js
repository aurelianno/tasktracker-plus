/*
  users.js
  Express router for user-related endpoints in TaskTracker+ backend.
  - Handles user account management, soft deletion, and preferences.
  - Secures routes with authentication middleware.
  - Delegates logic to user-related controllers.
*/

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Team = require('../models/Team');

router.get('/test', (req, res) => {
  res.json({ message: 'Users route working' });
});

router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Team.updateMany(
      { 'members.userId': userId },
      { $pull: { members: { userId } } }
    );

  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

router.patch('/me/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const allowedFields = ['theme', 'notifications', 'timezone'];
    const updates = {};
    if (req.body.theme) {
      if (!['light', 'dark', 'system'].includes(req.body.theme)) {
        return res.status(400).json({ message: 'Invalid theme value' });
      }
      updates['preferences.theme'] = req.body.theme;
    }
    if (req.body.notifications) {
      updates['preferences.notifications'] = req.body.notifications;
    }
    if (req.body.timezone) {
      updates['preferences.timezone'] = req.body.timezone;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid preference fields provided' });
    }
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
});

module.exports = router;