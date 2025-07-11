/*
  teamController.js
  Express controller for all team-related backend logic in TaskTracker+.
  - Handles team CRUD, membership, invitations, analytics, and role management.
  - Validates permissions for team actions and membership changes.
  - Returns structured JSON responses for API consumers.
*/
const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get user's teams
// @route   GET /api/teams
// @access  Private
const getUserTeams = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const teams = await Team.getUserTeams(userId);
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Check if team name already exists for this user
    const existingTeam = await Team.findOne({
      name: name.trim(),
      'members.userId': userId
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You already have a team with this name' });
    }

    const team = new Team({
      name: name.trim(),
      description: description?.trim(),
      createdBy: userId,
      members: [{
        userId: userId,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await team.save();
    await team.populate('members.userId', 'name email');
    
    // Set as user's current team
    await User.findByIdAndUpdate(userId, { currentTeam: team._id });

    res.status(201).json(team);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Team name already exists' });
    }
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

// @desc    Get single team details
// @route   GET /api/teams/:id
// @access  Private
const getTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate('members.userId', 'name email')
      .populate('createdBy', 'name email');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a member
    if (!team.isUserMember(userId)) {
      return res.status(403).json({ message: 'Access denied - you are not a member of this team' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (Admin only)
const updateTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is admin
    if (!team.isUserAdmin(userId)) {
      return res.status(403).json({ message: 'Only admins can update team details' });
    }

    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description?.trim();

    await team.save();
    await team.populate('members.userId', 'name email');

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
};

// @desc    Invite user to team by email
// @route   POST /api/teams/:id/invite
// @access  Private (Admin only)
const inviteToTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    const { email, role = 'collaborator' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is admin
    if (!team.isUserAdmin(userId)) {
      return res.status(403).json({ message: 'Only admins can invite members' });
    }

    // Find user by email
    const inviteeUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!inviteeUser) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Check if already a member
    if (team.isUserMember(inviteeUser._id)) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // Check if already has pending invitation
    const hasPendingInvitation = inviteeUser.teamInvitations.some(
      inv => inv.teamId.toString() === team._id.toString() && inv.status === 'pending'
    );

    if (hasPendingInvitation) {
      return res.status(400).json({ message: 'User already has a pending invitation to this team' });
    }

    // Add invitation to user
    inviteeUser.teamInvitations.push({
      teamId: team._id,
      invitedBy: userId,
      status: 'pending'
    });
    await inviteeUser.save();

    res.json({ 
      message: 'Invitation sent successfully',
      invitedUser: {
        name: inviteeUser.name,
        email: inviteeUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending invitation', error: error.message });
  }
};

// @desc    Get user's pending invitations
// @route   GET /api/teams/invitations
// @access  Private
const getInvitations = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId)
      .populate('teamInvitations.teamId', 'name description')
      .populate('teamInvitations.invitedBy', 'name email');

    const pendingInvitations = user.teamInvitations.filter(inv => inv.status === 'pending');

    res.json(pendingInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations', error: error.message });
  }
};

// @desc    Accept team invitation
// @route   POST /api/teams/invitations/:invitationId/accept
// @access  Private
const acceptInvitation = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { invitationId } = req.params;

    const user = await User.findById(userId);
    const invitation = user.teamInvitations.id(invitationId);
    
    if (!invitation || invitation.status !== 'pending') {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    const team = await Team.findById(invitation.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add user to team
    team.members.push({
      userId: userId,
      role: 'collaborator',
      invitedBy: invitation.invitedBy
    });
    await team.save();

    // Update invitation status
    invitation.status = 'accepted';
    await user.save();

    // Set as current team if user has no current team
    if (!user.currentTeam) {
      user.currentTeam = team._id;
      await user.save();
    }

    await team.populate('members.userId', 'name email');

    res.json({ 
      message: 'Invitation accepted successfully', 
      team 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting invitation', error: error.message });
  }
};

// @desc    Decline team invitation
// @route   POST /api/teams/invitations/:invitationId/decline
// @access  Private
const declineInvitation = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { invitationId } = req.params;

    const user = await User.findById(userId);
    const invitation = user.teamInvitations.id(invitationId);
    
    if (!invitation || invitation.status !== 'pending') {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    invitation.status = 'declined';
    await user.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    res.status(500).json({ message: 'Error declining invitation', error: error.message });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:memberId
// @access  Private (Admin only)
const removeMember = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id, memberId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is admin
    if (!team.isUserAdmin(userId)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Can't remove yourself if you're the only admin
    const adminCount = team.members.filter(m => m.role === 'admin').length;
    const ownerCount = team.members.filter(m => m.role === 'owner').length;
    const isRemovingSelf = userId.toString() === memberId.toString();
    const isRemovingAdmin = team.members.find(m => 
      m.userId.toString() === memberId.toString() && m.role === 'admin'
    );

    // Only block if removing last admin AND there is no owner left (should never happen, but for safety)
    if (isRemovingSelf && adminCount <= 1 && ownerCount === 0) {
      return res.status(400).json({ message: 'Cannot remove the last admin and owner' });
    }

    // Remove member
    team.members = team.members.filter(m => m.userId.toString() !== memberId.toString());
    await team.save();

    // Clear current team for removed user if this was their current team
    await User.findByIdAndUpdate(memberId, { 
      $unset: { currentTeam: 1 } 
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
const leaveTeam = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is member
    if (!team.isUserMember(userId)) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    // Check if user is the only admin
    const adminCount = team.members.filter(m => m.role === 'admin').length;
    const isUserAdmin = team.isUserAdmin(userId);

    if (isUserAdmin && adminCount <= 1 && team.members.length > 1) {
      return res.status(400).json({ 
        message: 'Cannot leave team as the only admin. Transfer admin role first or remove all other members.' 
      });
    }

    // Remove user from team
    team.members = team.members.filter(m => m.userId.toString() !== userId.toString());
    
    // If no members left, deactivate team
    if (team.members.length === 0) {
      team.isActive = false;
    }
    
    await team.save();

    // Clear current team for user
    await User.findByIdAndUpdate(userId, { $unset: { currentTeam: 1 } });

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving team', error: error.message });
  }
};

// @desc    Change a team member's role (admin only)
// @route   PUT /api/teams/:id/members/:memberId/role
// @access  Private (Admin only)
const changeMemberRole = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id, memberId } = req.params;
    const { role } = req.body;

    if (!['admin', 'collaborator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only admins can change roles
    if (!team.isUserAdmin(userId)) {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }

    const member = team.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Prevent demoting the last admin only if there is no owner
    if (member.role === 'admin' && role !== 'admin') {
      const adminCount = team.members.filter(m => m.role === 'admin').length;
      const ownerCount = team.members.filter(m => m.role === 'owner').length;
      if (adminCount <= 1 && ownerCount === 0) {
        return res.status(400).json({ message: 'Cannot remove the last admin and owner' });
      }
    }

    member.role = role;
    await team.save();
    await team.populate('members.userId', 'name email');
    res.json({ message: 'Role updated successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error changing member role', error: error.message });
  }
};

// @desc    Transfer team ownership (owner only)
// @route   PUT /api/teams/:id/transfer-ownership/:memberId
// @access  Private (Owner only)
const transferOwnership = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id, memberId } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    // Only owner can transfer ownership
    const owner = team.members.find(m => m.role === 'owner');
    if (!owner || owner.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the team owner can transfer ownership' });
    }
    if (owner.userId.toString() === memberId.toString()) {
      return res.status(400).json({ message: 'User is already the owner' });
    }
    const newOwner = team.members.find(m => m.userId.toString() === memberId);
    if (!newOwner) {
      return res.status(404).json({ message: 'Target member not found' });
    }
    // Set previous owner to admin
    owner.role = 'admin';
    // Set new owner
    newOwner.role = 'owner';
    await team.save();
    await team.populate('members.userId', 'name email');
    res.json({ message: 'Ownership transferred successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring ownership', error: error.message });
  }
};

module.exports = {
  getUserTeams,
  createTeam,
  getTeam,
  updateTeam,
  inviteToTeam,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  removeMember,
  leaveTeam,
  changeMemberRole,
  transferOwnership
};