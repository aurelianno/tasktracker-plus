/*
  Task.js
  Mongoose model for tasks in TaskTracker+ backend.
  - Defines schema for personal and team tasks, assignment, status, and analytics fields.
  - Includes methods for assignment, completion, and business logic.
*/
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        // Allow null/undefined dates, or dates in the future (date-only check)
        if (!date) return true;
        const due = new Date(date);
        const now = new Date();
        due.setHours(0,0,0,0);
        now.setHours(0,0,0,0);
        return due >= now;
      },
      message: 'Due date cannot be in the past'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Assignment history for tracking assignment changes
  assignmentHistory: [
    {
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      assignmentDate: { type: Date, default: Date.now },
      unassignedDate: { type: Date }
    }
  ],
  // Visibility field
  visibility: {
    type: String,
    enum: ['personal', 'team', 'assigned'],
    default: 'personal'
  },
  // Assignment date
  assignmentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task age in days
taskSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for due soon status (within 7 days)
taskSchema.virtual('isDueSoon').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.isOverdue) return false;
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.dueDate <= sevenDaysFromNow;
});

// Indexes for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedTo: 1, isArchived: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

// Compound index for common queries
taskSchema.index({ assignedTo: 1, isArchived: 1, status: 1 });

// Text index for search functionality
taskSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: { title: 10, description: 5 }
});

// Indexes for team assignment queries
taskSchema.index({ team: 1, assignedTo: 1, status: 1 });
taskSchema.index({ team: 1, visibility: 1 });

// Middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Middleware to set archivedAt when isArchived changes
taskSchema.pre('save', function(next) {
  if (this.isModified('isArchived')) {
    if (this.isArchived && !this.archivedAt) {
      this.archivedAt = new Date();
    } else if (!this.isArchived) {
      this.archivedAt = null;
    }
  }
  next();
});

// Method to toggle archive status
taskSchema.methods.toggleArchive = function() {
  this.isArchived = !this.isArchived;
  this.archivedAt = this.isArchived ? new Date() : null;
  return this.save();
};

// Method to mark as completed
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get user's task statistics
taskSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        assignedTo: mongoose.Types.ObjectId(userId),
        isArchived: { $ne: true }
      } 
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const overdue = await this.countDocuments({
    assignedTo: userId,
    isArchived: { $ne: true },
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  });

  return { stats, overdue };
};

// NEW: Static method to get team tasks
taskSchema.statics.getTeamTasks = async function(teamId, filters = {}, pagination = {}) {
  // Ensure we only get tasks that are specifically team tasks
  // and exclude individual tasks that might be assigned to team members
  const baseQuery = { 
    team: teamId,
    isArchived: { $ne: true } // Exclude archived tasks by default
  };
  
  // Merge with additional filters
  const query = { ...baseQuery, ...filters };
  
  // Remove isArchived from filters if it's explicitly set to true
  if (filters.includeArchived === 'true' || filters.includeArchived === true) {
    delete query.isArchived;
  }
  
  let queryBuilder = this.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 }); // Default sort by newest first
  
  // Apply pagination if provided
  if (pagination.skip !== undefined) {
    queryBuilder = queryBuilder.skip(pagination.skip);
  }
  if (pagination.limit !== undefined) {
    queryBuilder = queryBuilder.limit(pagination.limit);
  }
  
  return queryBuilder;
};

// Instance method: assignToMember
// Assigns the task to a member, updates assignmentDate and assignmentHistory
// Usage: await task.assignToMember(userId, assignedById)
taskSchema.methods.assignToMember = async function(userId, assignedById) {
  this.assignedTo = userId;
  this.assignmentDate = new Date();
  this.assignmentHistory.push({
    assignedTo: userId,
    assignedBy: assignedById,
    assignmentDate: this.assignmentDate
  });
  await this.save();
  return this;
};

// Instance method: unassign
// Unassigns the task, updates assignmentHistory
// Usage: await task.unassign()
taskSchema.methods.unassign = async function() {
  this.assignmentHistory.push({
    assignedTo: null,
    assignedBy: null,
    assignmentDate: null,
    unassignedDate: new Date()
  });
  this.assignedTo = null;
  this.assignmentDate = null;
  await this.save();
  return this;
};

// Instance method: reassign
// Reassigns the task to a new member, updates assignmentHistory
// Usage: await task.reassign(newUserId, assignedById)
taskSchema.methods.reassign = async function(newUserId, assignedById) {
  // Mark unassignment for previous assignee
  if (this.assignedTo) {
    this.assignmentHistory.push({
      assignedTo: this.assignedTo,
      assignedBy: assignedById,
      assignmentDate: this.assignmentDate,
      unassignedDate: new Date()
    });
  }
  this.assignedTo = newUserId;
  this.assignmentDate = new Date();
  this.assignmentHistory.push({
    assignedTo: newUserId,
    assignedBy: assignedById,
    assignmentDate: this.assignmentDate
  });
  await this.save();
  return this;
};

module.exports = mongoose.model('Task', taskSchema);