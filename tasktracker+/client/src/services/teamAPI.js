/*
  teamAPI.js
  API service for team-related operations in TaskTracker+ frontend.
  - Handles HTTP requests for team CRUD, membership, invitations, and role management.
  - Used by Redux thunks and components for team collaboration features.
*/

import api from './api';

export const teamAPI = {
  getUserTeams: () => api.get('/teams'),
  
  createTeam: (teamData) => api.post('/teams', teamData),
  
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
  
  updateTeam: (teamId, teamData) => api.put(`/teams/${teamId}`, teamData),
  
  inviteToTeam: (teamId, inviteData) => api.post(`/teams/${teamId}/invite`, inviteData),
  
  getInvitations: () => api.get('/teams/invitations'),
  
  acceptInvitation: (invitationId) => api.post(`/teams/invitations/${invitationId}/accept`),
  
  declineInvitation: (invitationId) => api.post(`/teams/invitations/${invitationId}/decline`),
  
  leaveTeam: (teamId) => api.post(`/teams/${teamId}/leave`),
  
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  
  changeMemberRole: (teamId, memberId, role) => api.put(`/teams/${teamId}/members/${memberId}/role`, { role }),
  
  transferOwnership: (teamId, memberId) => api.put(`/teams/${teamId}/transfer-ownership/${memberId}`)
};

export default teamAPI;