/*
  Team.js
  Mongoose model for teams in TaskTracker+ backend.
  - Defines schema for team info, membership, roles, and invitations.
  - Includes methods for role validation and membership management.
*/

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'collaborator'],
    default: 'collaborator'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  members: [teamMemberSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return (this.members || []).length;
});

// Virtual for admin count
teamSchema.virtual('adminCount').get(function() {
  return (this.members || []).filter(member => member.role === 'admin').length;
});

// Indexes
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ name: 1 });

// Static method to get user's teams
teamSchema.statics.getUserTeams = async function(userId) {
  return this.find({
    'members.userId': userId,
    isActive: true
  }).populate('members.userId', 'name email');
};

// Instance method to check if user is admin
teamSchema.methods.isUserAdmin = function(userId) {
  const member = this.members.find(member => {
    const id = member.userId._id ? member.userId._id.toString() : member.userId.toString();
    return id === userId.toString();
  });
  return member && (member.role === 'admin' || member.role === 'owner');
};

// Instance method to check if user is member
teamSchema.methods.isUserMember = function(userId) {
  return this.members.some(member => {
    const id = member.userId._id ? member.userId._id.toString() : member.userId.toString();
    return id === userId.toString();
  });
};

module.exports = mongoose.model('Team', teamSchema);