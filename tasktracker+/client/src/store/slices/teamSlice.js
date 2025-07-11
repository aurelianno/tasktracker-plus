/*
  teamSlice.js
  Redux slice for managing team state in TaskTracker+ frontend.
  - Handles fetching, creating, updating, and deleting teams via async thunks.
  - Stores team info, membership, invitations, and current team selection.
  - Integrates with backend API for team management and collaboration.
*/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teamAPI from '../../services/teamAPI';

// Async thunks
export const getUserTeams = createAsyncThunk(
  'teams/getUserTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getUserTeams();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await teamAPI.createTeam(teamData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const inviteToTeam = createAsyncThunk(
  'teams/inviteToTeam',
  async ({ teamId, inviteData }, { rejectWithValue }) => {
    try {
      const response = await teamAPI.inviteToTeam(teamId, inviteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

export const getInvitations = createAsyncThunk(
  'teams/getInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getInvitations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'teams/acceptInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await teamAPI.acceptInvitation(invitationId);
      return { invitationId, team: response.data.team };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

export const declineInvitation = createAsyncThunk(
  'teams/declineInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      await teamAPI.declineInvitation(invitationId);
      return invitationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decline invitation');
    }
  }
);

const getInitialCurrentTeam = () => {
  try {
    const stored = localStorage.getItem('currentTeam');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState = {
  teams: [],
  currentTeam: getInitialCurrentTeam(),
  invitations: [],
  isLoading: false,
  isCreating: false,
  isInviting: false,
  error: null,
  selectedTeamId: getInitialCurrentTeam()?._id || null
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
      state.selectedTeamId = action.payload?._id;
      try {
        localStorage.setItem('currentTeam', JSON.stringify(action.payload));
      } catch {}
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
      state.selectedTeamId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get teams
      .addCase(getUserTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
        // Set current team from localStorage if available and still exists
        const stored = getInitialCurrentTeam();
        if (stored && action.payload.some(t => t._id === stored._id)) {
          state.currentTeam = stored;
          state.selectedTeamId = stored._id;
        } else if (action.payload.length > 0) {
          state.currentTeam = action.payload[0];
          state.selectedTeamId = action.payload[0]._id;
          try {
            localStorage.setItem('currentTeam', JSON.stringify(action.payload[0]));
          } catch {}
        } else {
          state.currentTeam = null;
          state.selectedTeamId = null;
          try {
            localStorage.removeItem('currentTeam');
          } catch {}
        }
      })
      .addCase(getUserTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isCreating = false;
        state.teams.push(action.payload);
        state.currentTeam = action.payload;
        state.selectedTeamId = action.payload._id;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Invite to team
      .addCase(inviteToTeam.pending, (state) => {
        state.isInviting = true;
        state.error = null;
      })
      .addCase(inviteToTeam.fulfilled, (state) => {
        state.isInviting = false;
      })
      .addCase(inviteToTeam.rejected, (state, action) => {
        state.isInviting = false;
        state.error = action.payload;
      })
      
      // Get invitations
      .addCase(getInvitations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = action.payload;
      })
      .addCase(getInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Accept invitation
      .addCase(acceptInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        const { invitationId, team } = action.payload;
        // Remove invitation from list
        state.invitations = state.invitations.filter(inv => inv._id !== invitationId);
        // Add team to teams list if not already there
        if (team && !state.teams.find(t => t._id === team._id)) {
          state.teams.push(team);
        }
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Decline invitation
      .addCase(declineInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(declineInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove invitation from list
        state.invitations = state.invitations.filter(inv => inv._id !== action.payload);
      })
      .addCase(declineInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTeam, clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;