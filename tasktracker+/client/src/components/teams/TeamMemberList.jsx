/*
  TeamMemberList.jsx
  Component for displaying and managing team members in TaskTracker+.
  - Shows member roles, status, and allows admin/owner to manage roles.
  - Integrates with Redux and backend API for team membership updates.
  - Provides a user-friendly UI for team collaboration.
*/
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import InviteModal from './InviteModal';
import teamAPI from '../../services/teamAPI';
import ConfirmationDialog from '../tasks/ConfirmationDialog';
import Notification from '../common/Notification';
import { useTheme } from '../../ThemeContext.jsx';

const TeamMemberList = ({ team, onTeamUpdate }) => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [confirmTransfer, setConfirmTransfer] = useState({ open: false, member: null });
  const [confirmRoleChange, setConfirmRoleChange] = useState({ open: false, member: null, newRole: null });
  const [notification, setNotification] = useState({ isOpen: false, type: 'error', message: '' });

  if (!team) {
    return (
      <div style={styles.emptyState}>
        <p>Select a team to view members</p>
      </div>
    );
  }

  // Check if current user is admin
  const currentUserMember = team.members?.find(member => 
    member.userId._id === user.id || member.userId._id === user.userId
  );
  const isCurrentUserAdmin = currentUserMember?.role === 'admin';
  const isCurrentUserOwner = currentUserMember?.role === 'owner';

  const styles = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    inviteButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    membersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    memberCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    memberInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    memberAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px'
    },
    memberDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    memberName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    memberEmail: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    memberRole: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    roleBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    adminBadge: {
      background: '#fef3c7',
      color: '#92400e'
    },
    collaboratorBadge: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    roleSelect: {
      marginLeft: 12,
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      color: '#1e293b',
      fontWeight: 500,
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      transition: 'border 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    },
    roleSelectFocus: {
      border: '1.5px solid #3b82f6',
      boxShadow: '0 0 0 2px #dbeafe',
    },
    joinedDate: {
      fontSize: '11px',
      color: '#9ca3af'
    },
    emptyState: {
      textAlign: 'center',
      padding: '32px',
      color: '#6b7280'
    },
    youLabel: {
      fontSize: '11px',
      color: '#059669',
      fontWeight: '500',
      background: '#d1fae5',
      padding: '2px 6px',
      borderRadius: '3px'
    }
  };

  return (
    <div style={{ ...styles.container, border: `1.5px solid ${borderColor}` }}>
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
      <div style={styles.header}>
        <h3 style={styles.title}>
          Team Members ({team.members?.length || 0})
        </h3>
        {(isCurrentUserAdmin || isCurrentUserOwner) && (
          <button
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.2s',
            }}
            onClick={() => setIsInviteModalOpen(true)}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
            title="Invite Member"
          >
            <span style={{fontSize: '18px', fontWeight: 'bold'}}>+</span> Invite
          </button>
        )}
      </div>

      <div style={styles.membersList}>
        {team.members?.map(member => {
          const isCurrentUser = member.userId._id === user.id || member.userId._id === user.userId;
          const isOwner = member.role === 'owner';
          const isAdmin = member.role === 'admin';
          const isCollaborator = member.role === 'collaborator';
          return (
            <div key={member.userId._id} style={styles.memberCard}>
              <div style={styles.memberInfo}>
                <div style={styles.memberAvatar}>
                  {member.userId.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={styles.memberDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={styles.memberName}>
                      {member.userId.name || 'Unknown User'}
                    </p>
                    {isCurrentUser && (
                      <span style={styles.youLabel}>You</span>
                    )}
                    {isOwner && (
                      <span style={{ ...styles.roleBadge, background: '#fef9c3', color: '#b45309', marginLeft: 6 }}>👑 Owner</span>
                    )}
                  </div>
                  <p style={styles.memberEmail}>
                    {member.userId.email}
                  </p>
                  {member.joinedAt && (
                    <p style={styles.joinedDate}>
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div style={styles.memberRole}>
                <span
                  style={{
                    ...styles.roleBadge,
                    ...(isOwner ? { background: '#fef9c3', color: '#b45309' } : isAdmin ? styles.adminBadge : styles.collaboratorBadge)
                  }}
                >
                  {isOwner ? '👑 Owner' : isAdmin ? '🛡️ Admin' : '👤 Collaborator'}
                </span>
                {((isCurrentUserOwner && !isOwner) || (!isCurrentUserOwner && isCurrentUserAdmin && isCollaborator)) && (
                  <select
                    value={member.role}
                    disabled={updatingRoleId === member.userId._id}
                    onChange={e => {
                      const newRole = e.target.value;
                      setConfirmRoleChange({ open: true, member, newRole });
                    }}
                    style={styles.roleSelect}
                  >
                    {isCurrentUserOwner && !isOwner && <option value="owner">Owner</option>}
                    <option value="admin">Admin</option>
                    <option value="collaborator">Collaborator</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {team.members?.length === 0 && (
        <div style={styles.emptyState}>
          <p>No team members yet. Invite some collaborators!</p>
        </div>
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        team={team}
      />

      <ConfirmationDialog
        isOpen={confirmTransfer.open}
        onClose={() => setConfirmTransfer({ open: false, member: null })}
        onConfirm={async () => {
          if (confirmTransfer.member) {
            try {
              await teamAPI.transferOwnership(team._id, confirmTransfer.member.userId._id);
              if (onTeamUpdate) await onTeamUpdate();
            } catch (err) {
              alert('Failed to transfer ownership');
            }
          }
        }}
        title="Transfer Ownership"
        message={`Are you sure you want to make ${confirmTransfer.member?.userId?.name || 'this user'} the new team owner? This action cannot be undone.`}
        confirmText="Yes, Transfer"
        cancelText="Cancel"
        type="warning"
      />

      <ConfirmationDialog
        isOpen={confirmRoleChange.open}
        onClose={() => setConfirmRoleChange({ open: false, member: null, newRole: null })}
        onConfirm={async () => {
          if (confirmRoleChange.member && confirmRoleChange.newRole) {
            setUpdatingRoleId(confirmRoleChange.member.userId._id);
            console.log('[RoleChange] Attempting to change role', {
              teamId: team._id,
              memberId: confirmRoleChange.member.userId._id,
              newRole: confirmRoleChange.newRole,
              currentRole: confirmRoleChange.member.role
            });
            try {
              let apiResult;
              if (confirmRoleChange.newRole === 'owner') {
                apiResult = await teamAPI.transferOwnership(team._id, confirmRoleChange.member.userId._id);
                console.log('[RoleChange] Ownership transfer API result:', apiResult);
              } else {
                apiResult = await teamAPI.changeMemberRole(team._id, confirmRoleChange.member.userId._id, confirmRoleChange.newRole);
                console.log('[RoleChange] Role change API result:', apiResult);
              }
              if (onTeamUpdate) await onTeamUpdate();
            } catch (err) {
              let msg = 'Failed to update role';
              if (err?.response?.data?.message) {
                msg = err.response.data.message;
              }
              console.error('[RoleChange] Error:', err, 'Response:', err?.response);
              setNotification({ isOpen: true, type: 'error', message: msg });
            } finally {
              setUpdatingRoleId(null);
              setConfirmRoleChange({ open: false, member: null, newRole: null });
            }
          }
        }}
        title="Change Member Role"
        message={`Are you sure you want to change ${confirmRoleChange.member?.userId?.name || 'this user'}'s role to ${confirmRoleChange.newRole === 'owner' ? 'Owner' : confirmRoleChange.newRole === 'admin' ? 'Admin' : 'Collaborator'}?`}
        confirmText="Yes, Change"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default TeamMemberList;