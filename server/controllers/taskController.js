/*
  taskController.js
  Express controller for all task-related backend logic in TaskTracker+.
  - Handles CRUD operations, analytics, assignment, and team task management.
  - Validates permissions and business rules for personal and team tasks.
  - Returns structured JSON responses for API consumers.
*/
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const view = req.query.view || 'personal';
    let filter = {};
    
    // Enforce best practice: default to personal tasks if no view specified
    if (!req.query.view || req.query.view === 'personal') {
      filter = getPersonalTasksFilter(userId);
    } else if (view === 'assigned') {
      filter = { assignedTo: userId };
    } else if (view === 'team') {
      // Find all teams the user is a member of
      const user = await User.findById(userId);
      if (!user || !user.teams || !user.teams.length) {
        return res.json({ tasks: [], pagination: { currentPage: 1, totalPages: 1, totalTasks: 0, hasNext: false, hasPrev: false } });
      }
      filter = { team: { $in: user.teams } };
    } else if (view === 'all') {
      // All tasks user can see (created, assigned, or team)
      const user = await User.findById(userId);
      const teamIds = user && user.teams ? user.teams : [];
      filter = {
        $or: [
          { createdBy: userId },
          { assignedTo: userId },
          { team: { $in: teamIds } }
        ]
      };
    }
    // Merge with other filters (status, priority, etc.)
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 9, includeArchived = false, overdue = false } = req.query;
    
    if (!includeArchived || includeArchived === 'false') {
      filter.isArchived = { $ne: true };
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      );
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(lim);
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / lim);
    
    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalTasks,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
    res.json({ tasks, pagination });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const task = await Task.findOne({ _id: id, assignedTo: userId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assignedTo,
      dueDate,
      tags
    } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Create task object
    const taskData = {
      title: title.trim(),
      description: description?.trim(),
      status,
      priority,
      assignedTo: assignedTo || userId,
      createdBy: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || []
    };

    // Validate due date
    if (taskData.dueDate && taskData.dueDate < new Date()) {
      return res.status(400).json({ message: 'Due date cannot be in the past' });
    }

    const task = new Task(taskData);
    await task.save();

    // Populate the task before sending response
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const updates = req.body;

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // If team task, check team admin/owner
    if (task.team) {
      const team = await Team.findById(task.team);
      if (!team || !team.isUserAdmin(userId)) {
        return res.status(403).json({ message: 'Not authorized to update this team task' });
      }
    } else {
      // Personal/assigned task: only assignee can update
      if (task.assignedTo.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    }
    // Validate due date if provided
    if (updates.dueDate) {
      const due = new Date(updates.dueDate);
      const now = new Date();
      due.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      if (due < now) {
        return res.status(400).json({ message: 'Due date cannot be in the past' });
      }
    }
    // Update task
    let setCompletedAt = {};
    if (updates.status) {
      if (updates.status === 'completed' && !task.completedAt) {
        setCompletedAt.completedAt = new Date();
      } else if (updates.status !== 'completed' && task.completedAt) {
        setCompletedAt.completedAt = undefined;
      }
    }
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { ...updates, ...setCompletedAt },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
      res.json(updatedTask);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // If team task, check team admin/owner
    if (task.team) {
      const team = await Team.findById(task.team);
      if (!team || !team.isUserAdmin(userId)) {
        return res.status(403).json({ message: 'Not authorized to delete this team task' });
      }
    } else {
      // Personal/assigned task: only assignee can delete
      if (task.assignedTo.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
      }
    }
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully', taskId: id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// @desc    Archive/Unarchive task
// @route   PUT /api/tasks/:id/archive
// @access  Private
const archiveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // If team task, check team admin/owner
    if (task.team) {
      const team = await Team.findById(task.team);
      if (!team || !team.isUserAdmin(userId)) {
        return res.status(403).json({ message: 'Not authorized to archive this team task' });
      }
    } else {
      // Personal/assigned task: only assignee can archive
      if (task.assignedTo.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to archive this task' });
      }
    }
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        isArchived: !task.isArchived,
        archivedAt: !task.isArchived ? new Date() : null
      },
      { new: true }
    )
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
    const action = updatedTask.isArchived ? 'archived' : 'restored';
    res.json({
      ...updatedTask.toObject(),
      message: `Task ${action} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving task', error: error.message });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const now = new Date();
    // Only count personal tasks (not team tasks assigned to user)
    const validStatuses = ['todo', 'in-progress', 'completed'];
    const personalFilter = getPersonalTasksFilter(userId);
    const allTasks = await Task.find(personalFilter);
    // Get archived personal tasks count
    const archivedCount = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      isArchived: true
    });
    // Count by status (only among valid statuses)
    let todo = 0, inProgress = 0, completed = 0, overdue = 0;
    allTasks.forEach(task => {
      if (task.status === 'todo') todo++;
      if (task.status === 'in-progress') inProgress++;
      if (task.status === 'completed') completed++;
      if (task.status !== 'completed' && task.dueDate && task.dueDate < now) overdue++;
    });
    // Get recent personal tasks (last 5)
    const recentTasks = await Task.find({
      ...personalFilter
    })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);
    // Get upcoming deadlines (next 7 days)
    const upcomingDeadlines = await Task.find({
      ...personalFilter,
      status: { $ne: 'completed' },
      dueDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 })
    .limit(5);
    const statsResponse = {
      stats: [
        { _id: 'todo', count: todo },
        { _id: 'in-progress', count: inProgress },
        { _id: 'completed', count: completed }
      ],
      overdue,
      total: allTasks.length,
      archived: archivedCount,
      recentTasks,
      upcomingDeadlines
    };
    res.json(statsResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task statistics', error: error.message });
  }
};

// @desc    Get archived tasks for user
// @route   GET /api/tasks/archived
// @access  Private
const getArchivedTasks = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    let {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Defensive: ensure numeric values
    page = isNaN(parseInt(page)) ? 1 : parseInt(page);
    limit = isNaN(parseInt(limit)) ? 10 : parseInt(limit);
    if (!['asc', 'desc'].includes(sortOrder)) sortOrder = 'desc';
    if (!sortBy || typeof sortBy !== 'string') sortBy = 'createdAt';

    // Build filter for archived tasks
    const filter = { assignedTo: userId, isArchived: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const lim = limit;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(lim);
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / lim);
    const pagination = {
      currentPage: page,
      totalPages,
      totalTasks,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
    res.json({ tasks, pagination });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived tasks', error: error.message });
  }
};

// @desc    Get analytics data for charts - FIXED VERSION
// @route   GET /api/tasks/analytics
// @access  Private
const getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Status distribution (including overdue) - CONSISTENT with stats
    const now = new Date();
    const personalFilter = getPersonalTasksFilter(userId);
    const statusAgg = await Task.aggregate([
      { $match: personalFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Overdue count - same logic as stats
    const overdueCount = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    });
    
    const statusDistribution = {
      todo: statusAgg.find(s => s._id === 'todo')?.count || 0,
      'in-progress': statusAgg.find(s => s._id === 'in-progress')?.count || 0,
      completed: statusAgg.find(s => s._id === 'completed')?.count || 0,
      overdue: overdueCount
    };

    // 2. Priority distribution
    const priorityAgg = await Task.aggregate([
      { $match: personalFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    const priorityDistribution = {
      low: priorityAgg.find(p => p._id === 'low')?.count || 0,
      medium: priorityAgg.find(p => p._id === 'medium')?.count || 0,
      high: priorityAgg.find(p => p._id === 'high')?.count || 0
    };

    // 3. Completion trend (last 7 days) - FIXED: Handle missing completedAt
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      last7Days.push(day);
    }
    
    const completionTrend = [];
    for (let i = 0; i < 7; i++) {
      const start = new Date(last7Days[i]);
      const end = new Date(last7Days[i]);
      end.setDate(end.getDate() + 1);
      
      // FIXED: Count completed tasks for this day, handling missing completedAt
      const count = await Task.countDocuments({
        ...getPersonalTasksFilter(userId),
        status: 'completed',
        $or: [
          { completedAt: { $gte: start, $lt: end } },
          { 
            completedAt: { $exists: false },
            updatedAt: { $gte: start, $lt: end }
          }
        ]
      });
      
      completionTrend.push({
        date: start.toISOString().slice(0, 10),
        count
      });
    }

    // 4. Performance metrics - FIXED: Consistent with stats endpoint
    const validStatuses = ['todo', 'in-progress', 'completed'];
    const totalTasks = await Task.countDocuments({ 
      ...getPersonalTasksFilter(userId),
      status: { $in: validStatuses }
    });
    
    // FIXED: Count all completed tasks regardless of completedAt (like stats)
    const completedTasksCount = await Task.countDocuments({ 
      ...getPersonalTasksFilter(userId),
      status: 'completed'
    });
    
    const completionRate = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
    
    // For avg completion time, only use tasks with valid completedAt
    const completedTasksWithTime = await Task.find({ 
      ...getPersonalTasksFilter(userId),
      status: 'completed', 
      completedAt: { $exists: true, $ne: null }
    }, 'createdAt completedAt');
    
    let avgCompletionTime = null;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, t) => sum + (t.completedAt - t.createdAt), 0);
      avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60);
    }

    // 5. Monthly stats - same logic
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const createdThisMonth = await Task.countDocuments({ 
      ...getPersonalTasksFilter(userId),
      createdAt: { $gte: startOfMonth }
    });
    
    // FIXED: Monthly completed count (consistent with daily counts)
    const completedThisMonth = await Task.countDocuments({ 
      ...getPersonalTasksFilter(userId),
      status: 'completed',
      $or: [
        { completedAt: { $gte: startOfMonth } },
        { 
          completedAt: { $exists: false },
          updatedAt: { $gte: startOfMonth }
        }
      ]
    });
    
    const archivedThisMonth = await Task.countDocuments({ 
      ...getPersonalTasksFilter(userId),
      isArchived: true, 
      archivedAt: { $gte: startOfMonth }
    });

    const analyticsData = {
      statusDistribution,
      priorityDistribution,
      completionTrend,
      performance: {
        completionRate,
        avgCompletionTime,
        totalTasks
      },
      monthly: {
        created: createdThisMonth,
        completed: completedThisMonth,
        archived: archivedThisMonth
      }
    };

    // 6. KPI Calculations
    // --- Date helpers ---
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);
    // --- Tasks completed this week ---
    const tasksCompletedThisWeek = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      status: 'completed',
      $or: [
        { completedAt: { $gte: startOfWeek } },
        { completedAt: { $exists: false }, updatedAt: { $gte: startOfWeek } }
      ]
    });
    // --- Tasks completed last week ---
    const tasksCompletedLastWeek = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      status: 'completed',
      $or: [
        { completedAt: { $gte: startOfLastWeek, $lt: startOfWeek } },
        { completedAt: { $exists: false }, updatedAt: { $gte: startOfLastWeek, $lt: startOfWeek } }
      ]
    });
    // --- Overdue today ---
    const overdueToday = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      status: { $ne: 'completed' },
      dueDate: { $lt: now, $gte: startOfToday }
    });
    // --- Overdue yesterday ---
    const overdueYesterday = await Task.countDocuments({
      ...getPersonalTasksFilter(userId),
      status: { $ne: 'completed' },
      dueDate: { $lt: startOfToday, $gte: startOfYesterday }
    });
    // --- Completion rate this month ---
    const completionRateThisMonth = totalTasks > 0 ? (completedThisMonth / totalTasks) * 100 : 0;
    // --- Completion rate last month ---
    const completionRateLastMonth = analyticsData?.lastMonth?.performance?.completionRate ?? 0;
    // --- Compose new analyticsData ---
    analyticsData.kpi = {
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      tasksCompletedDiff: tasksCompletedThisWeek - tasksCompletedLastWeek,
      completionRateThisMonth,
      completionRateLastMonth,
      completionRateDiff: completionRateThisMonth - completionRateLastMonth,
      overdueToday,
      overdueYesterday,
      overdueDiff: overdueToday - overdueYesterday
    };
    res.json(analyticsData);
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// @desc    Assign a task to a member
// @route   POST /api/tasks/:taskId/assign
// @access  Private (Admin or assigner)
const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId: assignToId } = req.body;
    const assignedById = req.user.userId || req.user.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.assignToMember(assignToId, assignedById);
    res.json({ message: 'Task assigned', task });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};

// @desc    Unassign a task
// @route   POST /api/tasks/:taskId/unassign
// @access  Private (Admin or assigner)
const unassignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.unassign();
    res.json({ message: 'Task unassigned', task });
  } catch (error) {
    res.status(500).json({ message: 'Error unassigning task', error: error.message });
  }
};

// @desc    Reassign a task to a new member
// @route   POST /api/tasks/:taskId/reassign
// @access  Private (Admin or assigner)
const reassignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId: newUserId } = req.body;
    const assignedById = req.user.userId || req.user.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.reassign(newUserId, assignedById);
    res.json({ message: 'Task reassigned', task });
  } catch (error) {
    res.status(500).json({ message: 'Error reassigning task', error: error.message });
  }
};

// @desc    Get all tasks for a team
// @route   GET /api/tasks/team/:teamId
// @access  Private (Team member)
const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a member of the team
    const isMember = team.members.some(m => m.userId.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    // Get query parameters
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 9, archived } = req.query;

    // Build filter
    let filter = { team: teamId };

    // Handle archived filtering
    if (archived === 'true') {
      filter.isArchived = true;
    } else if (archived === 'false') {
      filter.isArchived = { $ne: true };
    } else {
      //
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(lim);

    const totalTasks = await Task.countDocuments(filter);

    const totalPages = Math.ceil(totalTasks / lim);
    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalTasks,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    res.json({ tasks, pagination });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team tasks', error: error.message });
  }
};

// @desc    Get all tasks assigned to the current user
// @route   GET /api/tasks/assigned/me
// @access  Private
const getMyAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const tasks = await Task.find({ assignedTo: userId, isArchived: { $ne: true } })
      .populate('createdBy', 'name email')
      .populate('team', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned tasks', error: error.message });
  }
};

// @desc    Get assignment history for a task
// @route   GET /api/tasks/:taskId/history
// @access  Private (Task member)
const getTaskAssignmentHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('assignmentHistory.assignedTo', 'name email').populate('assignmentHistory.assignedBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task.assignmentHistory || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment history', error: error.message });
  }
};

// @desc    Create a new team task
// @route   POST /api/tasks/team/:teamId
// @access  Private (Team member or admin)
const createTeamTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId || req.user.id;
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assignedTo,
      dueDate,
      tags
    } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Check if user is a member of the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.isUserMember(userId)) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    // Create task object
    const taskData = {
      title: title.trim(),
      description: description?.trim(),
      status,
      priority,
      assignedTo: assignedTo || userId,
      createdBy: userId,
      team: teamId,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || []
    };

    // Validate due date
    if (taskData.dueDate && taskData.dueDate < new Date()) {
      return res.status(400).json({ message: 'Due date cannot be in the past' });
    }

    const task = new Task(taskData);
    await task.save();

    // Populate the task before sending response
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating team task', error: error.message });
  }
};

// @desc    Get team analytics data
// @route   GET /api/tasks/analytics/team/:teamId
// @access  Private (Team member)
const getTeamAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.isUserMember(userId)) return res.status(403).json({ message: 'You are not a member of this team' });

    // Status distribution for team
    const now = new Date();
    const statusAgg = await Task.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId), isArchived: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const overdueCount = await Task.countDocuments({
      team: teamId,
      isArchived: { $ne: true },
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    });
    const statusDistribution = {
      todo: statusAgg.find(s => s._id === 'todo')?.count || 0,
      'in-progress': statusAgg.find(s => s._id === 'in-progress')?.count || 0,
      completed: statusAgg.find(s => s._id === 'completed')?.count || 0,
      overdue: overdueCount
    };
    // Completion rate
    const validStatuses = ['todo', 'in-progress', 'completed'];
    const totalTasks = await Task.countDocuments({ team: teamId, isArchived: { $ne: true }, status: { $in: validStatuses } });
    const completedTasksCount = await Task.countDocuments({ team: teamId, isArchived: { $ne: true }, status: 'completed' });
    const completionRate = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
    // Avg completion time
    const completedTasksWithTime = await Task.find({ team: teamId, isArchived: { $ne: true }, status: 'completed', completedAt: { $exists: true, $ne: null } }, 'createdAt completedAt');
    let avgCompletionTime = null;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, t) => sum + (t.completedAt - t.createdAt), 0);
      avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60);
    }
    // Overdue tasks per member (bottleneck)
    const overdueAgg = await Task.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId), isArchived: { $ne: true }, status: { $ne: 'completed' }, dueDate: { $lt: now } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Member performance comparison
    const memberPerfAgg = await Task.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId), isArchived: { $ne: true } } },
      { $group: { _id: '$assignedTo', completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { completed: -1 } }
    ]);
    
    // Populate user names for member performance data
    const User = require('../models/User');
    const populatedMemberPerfAgg = await Promise.all(
      memberPerfAgg.map(async (member) => {
        if (member._id) {
          const user = await User.findById(member._id).select('name email');
          return {
            ...member,
            _id: {
              _id: member._id,
              name: user?.name || 'Unknown Member',
              email: user?.email
            }
          };
        }
        return member;
      })
    );
    // Team velocity (tasks completed this week vs last week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);
    const tasksCompletedThisWeek = await Task.countDocuments({ team: teamId, isArchived: { $ne: true }, status: 'completed', completedAt: { $gte: startOfWeek } });
    const tasksCompletedLastWeek = await Task.countDocuments({ team: teamId, isArchived: { $ne: true }, status: 'completed', completedAt: { $gte: startOfLastWeek, $lt: endOfLastWeek } });
    // Team efficiency score (custom: completionRate * (1 - overdue/total))
    const efficiencyScore = completionRate * (1 - (overdueCount / (totalTasks || 1)));
    res.json({
      statusDistribution,
      completionRate,
      avgCompletionTime,
      overdueAgg,
      memberPerfAgg: populatedMemberPerfAgg,
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      efficiencyScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team analytics', error: error.message });
  }
};

// @desc    Get team workload distribution
// @route   GET /api/tasks/analytics/team/:teamId/workload
// @access  Private (Team member)
const getTeamWorkloadDistribution = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.isUserMember(userId)) return res.status(403).json({ message: 'You are not a member of this team' });
    // Workload: count of tasks per member
    const workloadAgg = await Task.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId), isArchived: { $ne: true } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ workload: workloadAgg });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team workload', error: error.message });
  }
};

// @desc    Get team productivity trends
// @route   GET /api/tasks/analytics/team/:teamId/trends
// @access  Private (Team member)
const getTeamProductivityTrends = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.isUserMember(userId)) return res.status(403).json({ message: 'You are not a member of this team' });
    // Completion trend (last 7 days)
    const now = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      last7Days.push(day);
    }
    const completionTrend = [];
    for (let i = 0; i < 7; i++) {
      const start = new Date(last7Days[i]);
      const end = new Date(last7Days[i]);
      end.setDate(end.getDate() + 1);
      const count = await Task.countDocuments({
        team: teamId,
        isArchived: { $ne: true },
        status: 'completed',
        completedAt: { $gte: start, $lt: end }
      });
      completionTrend.push({ date: start.toISOString().slice(0, 10), count });
    }
    res.json({ completionTrend });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team productivity trends', error: error.message });
  }
};

// @desc    Get individual team member analytics
// @route   GET /api/tasks/analytics/team/:teamId/member/:memberId
// @access  Private (Team admin/owner only)
const getTeamMemberAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { teamId, memberId } = req.params;
    
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    // Check if user is admin/owner
    if (!team.isUserAdmin(userId)) {
      return res.status(403).json({ message: 'Only team admins and owners can view individual member analytics' });
    }
    
    // Check if member exists in team and populate user data
    const member = team.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    // Populate user data for the member
    await team.populate('members.userId', 'name email');
    const populatedMember = team.members.find(m => m.userId._id.toString() === memberId);

    const now = new Date();
    
    // Member's task statistics
    const memberTasks = await Task.find({
      team: teamId,
      assignedTo: memberId,
      isArchived: { $ne: true }
    });

    const statusDistribution = {
      todo: memberTasks.filter(t => t.status === 'todo').length,
      'in-progress': memberTasks.filter(t => t.status === 'in-progress').length,
      completed: memberTasks.filter(t => t.status === 'completed').length,
      overdue: memberTasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < now).length
    };

    const totalTasks = memberTasks.length;
    const completedTasks = statusDistribution.completed;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Average completion time
    const completedTasksWithTime = memberTasks.filter(t => t.status === 'completed' && t.completedAt);
    let avgCompletionTime = null;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, t) => sum + (t.completedAt - t.createdAt), 0);
      avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60);
    }

    // Tasks completed this week vs last week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);

    const tasksCompletedThisWeek = memberTasks.filter(t => 
      t.status === 'completed' && t.completedAt && t.completedAt >= startOfWeek
    ).length;

    const tasksCompletedLastWeek = memberTasks.filter(t => 
      t.status === 'completed' && t.completedAt && t.completedAt >= startOfLastWeek && t.completedAt < endOfLastWeek
    ).length;

    // Priority distribution
    const priorityDistribution = {
      low: memberTasks.filter(t => t.priority === 'low').length,
      medium: memberTasks.filter(t => t.priority === 'medium').length,
      high: memberTasks.filter(t => t.priority === 'high').length,
      critical: memberTasks.filter(t => t.priority === 'critical').length
    };

    // Completion trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      last7Days.push(day);
    }

    const completionTrend = [];
    for (let i = 0; i < 7; i++) {
      const start = new Date(last7Days[i]);
      const end = new Date(last7Days[i]);
      end.setDate(end.getDate() + 1);
      const count = memberTasks.filter(t => 
        t.status === 'completed' && t.completedAt && t.completedAt >= start && t.completedAt < end
      ).length;
      completionTrend.push({ date: start.toISOString().slice(0, 10), count });
    }

    // Efficiency score
    const efficiencyScore = completionRate * (1 - (statusDistribution.overdue / (totalTasks || 1)));

    res.json({
      member: {
        _id: populatedMember.userId._id,
        name: populatedMember.userId.name || 'Unknown Member',
        email: populatedMember.userId.email,
        role: populatedMember.role
      },
      statusDistribution,
      completionRate,
      avgCompletionTime,
      tasksCompletedThisWeek,
      tasksCompletedLastWeek,
      priorityDistribution,
      completionTrend,
      efficiencyScore,
      totalTasks,
      completedTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team member analytics', error: error.message });
  }
};

// Utility: Get filter for personal tasks (used everywhere for consistency)
function getPersonalTasksFilter(userId) {
  return {
    assignedTo: userId,
    isArchived: { $ne: true },
    $or: [
      { team: null },
      { team: { $exists: false } }
    ]
  };
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  getTaskStats,
  getArchivedTasks,
  getTaskAnalytics,
  // New methods
  assignTask,
  unassignTask,
  reassignTask,
  getTeamTasks,
  getMyAssignedTasks,
  getTaskAssignmentHistory,
  createTeamTask,
  getTeamAnalytics,
  getTeamWorkloadDistribution,
  getTeamProductivityTrends,
  getTeamMemberAnalytics
};