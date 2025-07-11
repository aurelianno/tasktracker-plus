/*
  taskSlice.js
  Redux slice for managing all task-related state in TaskTracker+ frontend.
  - Handles fetching, creating, updating, archiving, and deleting tasks via async thunks.
  - Stores analytics, stats, filters, and pagination for personal and team tasks.
  - Integrates with backend API for data sync and analytics.
*/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { fetchArchivedTasks } from '../../services/api';

// Async thunks for API calls
export const getTasks = createAsyncThunk(
  'tasks/getTasks',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const currentState = getState();
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          if (typeof filters[key] === 'boolean') {
            params.append(key, String(filters[key]));
          } else {
            params.append(key, filters[key]);
          }
        }
      });
      
      const response = await api.get(`/tasks?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const getTask = createAsyncThunk(
  'tasks/getTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const archiveTask = createAsyncThunk(
  'tasks/archiveTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}/archive`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive task');
    }
  }
);

export const getTaskStats = createAsyncThunk(
  'tasks/getTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task stats');
    }
  }
);

export const getArchivedTasks = createAsyncThunk(
  'tasks/getArchivedTasks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== false) {
          params.append(key, filters[key]);
        }
      });
      const response = await fetchArchivedTasks(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch archived tasks');
    }
  }
);

export const getTaskAnalytics = createAsyncThunk(
  'tasks/getTaskAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  tasks: [],
  archivedTasks: [],
  currentTask: null,
  stats: {
    stats: [],
    overdue: 0,
    total: 0,
    archived: 0, // 🔥 NEW: Add archived count
    recentTasks: [],
    upcomingDeadlines: []
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    status: '',
    priority: '',
    assignedTo: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeArchived: false, // 🔥 NEW: Add includeArchived filter
    overdue: false,
    page: 1
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isArchiving: false,
  error: null,
  analytics: {
    statusDistribution: { todo: 0, 'in-progress': 0, completed: 0, overdue: 0, archived: 0 },
    priorityDistribution: { critical: 0, low: 0, medium: 0, high: 0 },
    completionTrend: [],
    completionCalendar: [],
    monthly: { created: 0, completed: 0, archived: 0 },
    performance: { completionRate: 0, avgCompletionTime: null, totalTasks: 0 },
    analyticsLoading: false,
    analyticsError: null
  }
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.isArchiving = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      // 🔥 COMPLETE REPLACEMENT instead of merge to prevent filter lag
      
      // Complete replacement - start with clean slate
      state.filters = { ...initialState.filters, ...action.payload };
      
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    // Optimistic updates for better UX
    optimisticUpdateTask: (state, action) => {
      const { taskId, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
      if (state.currentTask && state.currentTask._id === taskId) {
        state.currentTask = { ...state.currentTask, ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get tasks
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get single task
      .addCase(getTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tasks.unshift(action.payload);
        state.pagination.totalTasks += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isUpdating = false;
        const taskIndex = state.tasks.findIndex(task => task._id === action.payload._id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.pagination.totalTasks -= 1;
        if (state.currentTask && state.currentTask._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Archive task
      .addCase(archiveTask.pending, (state) => {
        state.isArchiving = true;
        state.error = null;
      })
      .addCase(archiveTask.fulfilled, (state, action) => {
        state.isArchiving = false;
        const updatedTask = action.payload;
        
        // 🔥 IMPROVED: Better archive handling
        if (!state.filters.includeArchived && updatedTask.isArchived) {
          // Remove from list if we're not showing archived tasks and task was archived
          state.tasks = state.tasks.filter(task => task._id !== updatedTask._id);
        } else if (state.filters.includeArchived && !updatedTask.isArchived) {
          // Remove from list if we're showing only archived tasks and task was restored
          state.tasks = state.tasks.filter(task => task._id !== updatedTask._id);
        } else {
          // Update in place
          const taskIndex = state.tasks.findIndex(task => task._id === updatedTask._id);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = updatedTask;
          }
        }
        
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      })
      .addCase(archiveTask.rejected, (state, action) => {
        state.isArchiving = false;
        state.error = action.payload;
      })
      
      // Get task stats
      .addCase(getTaskStats.pending, (state) => {
        // Don't set loading for stats - it's background data
      })
      .addCase(getTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getTaskStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Get archived tasks
      .addCase(getArchivedTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArchivedTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.archivedTasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(getArchivedTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get task analytics
      .addCase(getTaskAnalytics.pending, (state) => {
        state.analytics.analyticsLoading = true;
        state.analytics.analyticsError = null;
      })
      .addCase(getTaskAnalytics.fulfilled, (state, action) => {
        state.analytics.analyticsLoading = false;
        state.analytics.analyticsError = null;
        state.analytics.statusDistribution = action.payload.statusDistribution;
        state.analytics.priorityDistribution = action.payload.priorityDistribution;
        state.analytics.completionTrend = action.payload.completionTrend;
        state.analytics.completionCalendar = action.payload.completionCalendar || [];
        state.analytics.monthly = action.payload.monthly;
        state.analytics.performance = action.payload.performance;
      })
      .addCase(getTaskAnalytics.rejected, (state, action) => {
        state.analytics.analyticsLoading = false;
        state.analytics.analyticsError = action.payload;
      });
  }
});

export const {
  reset,
  clearError,
  setFilters,
  clearFilters,
  setCurrentTask,
  clearCurrentTask,
  optimisticUpdateTask
} = taskSlice.actions;

export default taskSlice.reducer;