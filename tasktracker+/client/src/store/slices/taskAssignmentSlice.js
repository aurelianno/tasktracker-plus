/*
  taskAssignmentSlice.js
  Redux slice for managing task assignment and team analytics in TaskTracker+ frontend.
  - Handles fetching, assigning, and tracking tasks within teams via async thunks.
  - Stores team analytics, workload, trends, and member performance data.
  - Integrates with backend API for real-time team collaboration and analytics.
*/

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const assignTask = createAsyncThunk(
  'taskAssignment/assignTask',
  async ({ taskId, memberId, teamId, note }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/assign`, { memberId, teamId, note });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign task');
    }
  }
);

export const unassignTask = createAsyncThunk(
  'taskAssignment/unassignTask',
  async ({ taskId, note }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/unassign`, { note });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign task');
    }
  }
);

export const reassignTask = createAsyncThunk(
  'taskAssignment/reassignTask',
  async ({ taskId, newMemberId, note }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/reassign`, { newMemberId, note });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reassign task');
    }
  }
);

export const getTeamTasks = createAsyncThunk(
  'taskAssignment/getTeamTasks',
  async ({ teamId, filters }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/team/${teamId}`, { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team tasks');
    }
  }
);

export const createTeamTask = createAsyncThunk(
  'taskAssignment/createTeamTask',
  async ({ teamId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/team/${teamId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team task');
    }
  }
);

export const getTeamAnalytics = createAsyncThunk(
  'taskAssignment/getTeamAnalytics',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/analytics/team/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team analytics');
    }
  }
);

export const getTeamWorkload = createAsyncThunk(
  'taskAssignment/getTeamWorkload',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/analytics/team/${teamId}/workload`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team workload');
    }
  }
);

export const getTeamTrends = createAsyncThunk(
  'taskAssignment/getTeamTrends',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/analytics/team/${teamId}/trends`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team trends');
    }
  }
);

export const getTeamMemberAnalytics = createAsyncThunk(
  'taskAssignment/getTeamMemberAnalytics',
  async ({ teamId, memberId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/analytics/team/${teamId}/member/${memberId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team member analytics');
    }
  }
);

const initialState = {
  selectedTeamId: null,
  teamTasks: [],
  isAssigning: false,
  isUnassigning: false,
  isReassigning: false,
  isLoadingTeamTasks: false,
  isCreatingTeamTask: false,
  error: null,
  teamAnalytics: null,
  teamWorkload: null,
  teamTrends: null,
  analyticsLoading: false,
  teamMemberAnalytics: null,
  selectedMemberId: null
};

const taskAssignmentSlice = createSlice({
  name: 'taskAssignment',
  initialState,
  reducers: {
    setSelectedTeam: (state, action) => {
      state.selectedTeamId = action.payload;
    },
    setSelectedMember: (state, action) => {
      state.selectedMemberId = action.payload;
      if (!action.payload) {
        state.teamMemberAnalytics = null;
      }
    },
    clearTeamTasks: (state) => {
      state.teamTasks = [];
    },
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Assign Task
      .addCase(assignTask.pending, (state) => {
        state.isAssigning = true;
        state.error = null;
      })
      .addCase(assignTask.fulfilled, (state, action) => {
        state.isAssigning = false;
        // Optionally update state with assigned task
      })
      .addCase(assignTask.rejected, (state, action) => {
        state.isAssigning = false;
        state.error = action.payload;
      })
      // Unassign Task
      .addCase(unassignTask.pending, (state) => {
        state.isUnassigning = true;
        state.error = null;
      })
      .addCase(unassignTask.fulfilled, (state, action) => {
        state.isUnassigning = false;
        // Optionally update state
      })
      .addCase(unassignTask.rejected, (state, action) => {
        state.isUnassigning = false;
        state.error = action.payload;
      })
      // Reassign Task
      .addCase(reassignTask.pending, (state) => {
        state.isReassigning = true;
        state.error = null;
      })
      .addCase(reassignTask.fulfilled, (state, action) => {
        state.isReassigning = false;
        // Optionally update state
      })
      .addCase(reassignTask.rejected, (state, action) => {
        state.isReassigning = false;
        state.error = action.payload;
      })
      // Get Team Tasks
      .addCase(getTeamTasks.pending, (state) => {
        state.isLoadingTeamTasks = true;
        state.error = null;
      })
      .addCase(getTeamTasks.fulfilled, (state, action) => {
        state.isLoadingTeamTasks = false;
        state.teamTasks = action.payload.tasks || [];
      })
      .addCase(getTeamTasks.rejected, (state, action) => {
        state.isLoadingTeamTasks = false;
        state.error = action.payload;
      })
      // Create Team Task
      .addCase(createTeamTask.pending, (state) => {
        state.isCreatingTeamTask = true;
        state.error = null;
      })
      .addCase(createTeamTask.fulfilled, (state, action) => {
        state.isCreatingTeamTask = false;
        state.teamTasks.push(action.payload);
      })
      .addCase(createTeamTask.rejected, (state, action) => {
        state.isCreatingTeamTask = false;
        state.error = action.payload;
      })
      // Get Team Analytics
      .addCase(getTeamAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getTeamAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.teamAnalytics = action.payload;
      })
      .addCase(getTeamAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.teamAnalytics = null;
        state.error = action.payload;
      })
      // Get Team Workload
      .addCase(getTeamWorkload.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getTeamWorkload.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.teamWorkload = action.payload;
      })
      .addCase(getTeamWorkload.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.teamWorkload = null;
        state.error = action.payload;
      })
      // Get Team Trends
      .addCase(getTeamTrends.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getTeamTrends.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.teamTrends = action.payload;
      })
      .addCase(getTeamTrends.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.teamTrends = null;
        state.error = action.payload;
      })
      // Get Team Member Analytics
      .addCase(getTeamMemberAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getTeamMemberAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.teamMemberAnalytics = action.payload;
      })
      .addCase(getTeamMemberAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.teamMemberAnalytics = null;
        state.error = action.payload;
      });
  }
});

export const { setSelectedTeam, setSelectedMember, clearTeamTasks, clearErrors } = taskAssignmentSlice.actions;
export default taskAssignmentSlice.reducer;
