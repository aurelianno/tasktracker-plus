/*
  teams.js
  Express router for team-related endpoints in TaskTracker+ backend.
  - Handles team CRUD, membership, invitations, analytics, and role management routes.
  - Secures routes with authentication middleware.
  - Delegates logic to team-related controllers.
*/

const express = require('express');
const router = express.Router();
const {
  getUserTeams,
  createTeam,
  getTeam,
  updateTeam,
  inviteToTeam,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  removeMember,
  leaveTeam
} = require('../controllers/teamController');
const protect = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Team routes
router.route('/')
  .get(getUserTeams)      // GET /api/teams - Get user's teams
  .post(createTeam);      // POST /api/teams - Create new team

// Invitation routes
router.route('/invitations')
  .get(getInvitations);   // GET /api/teams/invitations - Get pending invitations

router.route('/invitations/:invitationId/accept')
  .post(acceptInvitation); // POST /api/teams/invitations/:id/accept

router.route('/invitations/:invitationId/decline')
  .post(declineInvitation); // POST /api/teams/invitations/:id/decline

// Specific team routes
router.route('/:id')
  .get(getTeam)           // GET /api/teams/:id - Get team details
  .put(updateTeam);       // PUT /api/teams/:id - Update team details

router.route('/:id/invite')
  .post(inviteToTeam);    // POST /api/teams/:id/invite - Invite user to team

router.route('/:id/leave')
  .post(leaveTeam);       // POST /api/teams/:id/leave - Leave team

router.route('/:id/members/:memberId')
  .delete(removeMember);  // DELETE /api/teams/:id/members/:memberId - Remove member

router.route('/:id/members/:memberId/role')
  .put(require('../controllers/teamController').changeMemberRole); // PUT /api/teams/:id/members/:memberId/role - Change member role

router.route('/:id/transfer-ownership/:memberId')
  .put(require('../controllers/teamController').transferOwnership); // PUT /api/teams/:id/transfer-ownership/:memberId - Transfer ownership

module.exports = router;