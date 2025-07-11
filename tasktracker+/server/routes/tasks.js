/*
  tasks.js
  Express router for task-related endpoints in TaskTracker+ backend.
  - Handles CRUD, analytics, assignment, and team task management routes.
  - Secures routes with authentication middleware.
  - Delegates logic to task-related controllers.
*/

const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  getTaskStats,
  getArchivedTasks,
  getTaskAnalytics,
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
} = require('../controllers/taskController');
const auth = require('../middleware/auth'); 

// All routes are protected (require authentication)
router.use(auth); // ← Use your existing auth function

// @route   GET /api/tasks/stats
// @desc    Get task statistics for current user
// @access  Private
router.get('/stats', getTaskStats);

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', getTasks);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', createTask);

// @route   GET /api/tasks/archived
// @desc    Get all archived tasks for user
// @access  Private
router.get('/archived', getArchivedTasks);

// @route   GET /api/tasks/analytics
// @desc    Get analytics data for charts
// @access  Private
router.get('/analytics', getTaskAnalytics);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', getTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', deleteTask);

// @route   PUT /api/tasks/:id/archive
// @desc    Archive/unarchive task
// @access  Private
router.put('/:id/archive', archiveTask);

// Assignment and team task routes
router.post('/team/:teamId', createTeamTask);
router.post('/:taskId/assign', assignTask);
router.post('/:taskId/unassign', unassignTask);
router.post('/:taskId/reassign', reassignTask);
router.get('/team/:teamId', getTeamTasks);
router.get('/assigned/me', getMyAssignedTasks);
router.get('/:taskId/history', getTaskAssignmentHistory);

// Team analytics routes
router.get('/analytics/team/:teamId', getTeamAnalytics);
router.get('/analytics/team/:teamId/workload', getTeamWorkloadDistribution);
router.get('/analytics/team/:teamId/trends', getTeamProductivityTrends);
router.get('/analytics/team/:teamId/member/:memberId', getTeamMemberAnalytics);

module.exports = router;