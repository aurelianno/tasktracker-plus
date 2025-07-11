// Utility functions for team role validation

/**
 * Checks if the user is an admin or owner of the specified team.
 * @param {Object} user - The user object (should have a 'teams' array).
 * @param {string} teamId - The team ID to check.
 * @returns {boolean}
 */
export function isTeamAdmin(user, teamId) {
  if (!user?.teams) return false;
  const team = user.teams.find(t => t.teamId === teamId || t._id === teamId);
  return team && (team.role === 'admin' || team.role === 'owner');
}

/**
 * Checks if the user is the owner of the specified team.
 * @param {Object} user - The user object (should have a 'teams' array).
 * @param {string} teamId - The team ID to check.
 * @returns {boolean}
 */
export function isTeamOwner(user, teamId) {
  if (!user?.teams) return false;
  const team = user.teams.find(t => t.teamId === teamId || t._id === teamId);
  return team && team.role === 'owner';
}

/**
 * Returns true if the user can manage team tasks (admin or owner).
 * @param {Object} user - The user object (should have a 'teams' array).
 * @param {string} teamId - The team ID to check.
 * @returns {boolean}
 */
export function canManageTeamTasks(user, teamId) {
  return isTeamAdmin(user, teamId);
} 