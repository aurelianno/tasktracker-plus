/*
  TaskCard.jsx
  Card component for displaying individual tasks in TaskTracker+.
  - Shows task details, status, priority, and actions (edit, archive, delete).
  - Used in personal and team task lists for consistent UI/UX.
  - Integrates with Redux for state updates and backend API for actions.
*/
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask, archiveTask } from '../../store/slices/taskSlice';
import TaskForm from './TaskForm';
import ConfirmationDialog from './ConfirmationDialog';
import { useTheme } from '../../ThemeContext.jsx';

const baseActionButton = {
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '14px',
  padding: '10px 20px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
};
const loadingSpinner = {
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginRight: '8px'
};

const TaskCard = ({ task, onDelete, view = 'grid', onFadeOut, onUpdate, isArchived, userRole, onTaskEditSuccess, teamMembers = null }) => {
  const dispatch = useDispatch();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const menuTimeout = useRef(null);
  const menuRef = useRef(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  const archived = isArchived || task.isArchived;

  // Always allow edit/archive/delete for personal tasks (no userRole) or if admin/owner for team tasks
  const canEdit = userRole === undefined || userRole === null || userRole === 'admin' || userRole === 'owner';

  // Auto-close menu after 3 seconds, but not if hovered
  useEffect(() => {
    if (showActionMenu && !isMenuHovered) {
      if (menuTimeout.current) clearTimeout(menuTimeout.current);
      menuTimeout.current = setTimeout(() => setShowActionMenu(false), 3000);
    }
    return () => {
      if (menuTimeout.current) clearTimeout(menuTimeout.current);
    };
  }, [showActionMenu, isMenuHovered]);

  // Close menu if another menu is opened (using a custom event)
  useEffect(() => {
    const closeMenu = (e) => {
      if (e.detail !== task._id) setShowActionMenu(false);
    };
    window.addEventListener('taskcard-menu-open', closeMenu);
    return () => window.removeEventListener('taskcard-menu-open', closeMenu);
  }, [task._id]);

  // Close menu when view changes
  useEffect(() => {
    setShowActionMenu(false);
  }, [view]);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('taskcard-menu-open', { detail: task._id }));
    setShowActionMenu(v => !v);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#6b7280';
      case 'in-progress': return '#2563eb';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return '⏳';
      case 'in-progress': return '🔄';
      case 'completed': return '✅';
      default: return '⏳';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '🟡';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getPriorityDisplayName = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const handleStatusChange = (newStatus) => {
    if (task.status !== newStatus) {
      setFadingOut(true);
      setTimeout(() => {
        dispatch(updateTask({
          taskId: task._id,
          taskData: { status: newStatus }
        }))
          .then((result) => {
            setFadingOut(false);
            if (onFadeOut) onFadeOut(task._id);
            if (onUpdate) onUpdate();
          })
          .catch((error) => {
            setFadingOut(false);
            console.error('❌ Failed to update task:', error);
          });
      }, 500); // 500ms fade out
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditForm(true);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    setShowArchiveConfirm(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteTask = async () => {
    try {
      if (typeof deleteTask !== 'undefined') {
        await dispatch(deleteTask(task._id));
      } else if (onDelete) {
        await onDelete(task._id);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const handleArchiveTask = async () => {
    setShowArchiveConfirm(false);
    setShowLoadingOverlay(true);
    try {
      await dispatch(archiveTask(task._id));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to archive task:', error);
      throw error;
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleRestoreTask = async () => {
    setShowRestoreConfirm(false);
    setShowLoadingOverlay(true);
    try {
      await dispatch(archiveTask(task._id)); // restore is the same as archive (toggles archived state)
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to restore task:', error);
      throw error;
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleRestore = async () => {
    setShowRestoreConfirm(true);
  };

  const confirmRestore = async () => {
    setFadingOut(true);
    try {
      await handleRestoreTask();
      setFadingOut(false);
      if (onFadeOut) onFadeOut(task._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      setFadingOut(false);
    }
  };

  const handleDeletePermanent = async (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setShowLoadingOverlay(true);
    try {
      await handleDeleteTask();
    } catch (error) {
      // Optionally show error
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueSoon = task.dueDate && !isOverdue && task.status !== 'completed' && 
    new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const styles = {
    gridCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '20px',
      border: `1.5px solid ${borderColor}`,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      minHeight: '240px',
      display: 'flex',
      flexDirection: 'column'
    },
    listCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px',
      padding: '16px 20px',
      border: `1.5px solid ${borderColor}`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minHeight: '80px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    listHeader: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: 0
    },
    title: {
      fontSize: view === 'grid' ? '16px' : '15px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
      lineHeight: 1.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: view === 'grid' ? 2 : 1,
      WebkitBoxOrient: 'vertical',
      flex: view === 'list' ? '1' : 'auto'
    },
    titleCompleted: {
      textDecoration: 'line-through',
      opacity: 0.6
    },
    description: {
      fontSize: '14px',
      color: '#64748b',
      lineHeight: 1.5,
      marginBottom: '16px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical'
    },
    statusSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: view === 'grid' ? '12px' : 0,
      flexWrap: 'wrap'
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      whiteSpace: 'nowrap'
    },
    priorityBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      whiteSpace: 'nowrap'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: view === 'grid' ? '16px' : 0,
      marginTop: view === 'list' ? '0' : '0'
    },
    tag: {
      background: '#eff6ff',
      color: '#1d4ed8',
      padding: '2px 6px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
      paddingTop: '8px',
      marginBottom: '12px'
    },
    listFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0
    },
    listContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: 1,
      minWidth: 0
    },
    listMetaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    dateInfo: {
      fontSize: '12px',
      color: '#64748b',
      whiteSpace: 'nowrap'
    },
    dueDateWarning: {
      color: '#f59e0b',
      fontWeight: '500'
    },
    dueDateOverdue: {
      color: '#ef4444',
      fontWeight: '500'
    },
    assignedTo: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#64748b',
      whiteSpace: 'nowrap'
    },
    avatar: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '10px',
      fontWeight: '600',
      flexShrink: 0
    },
    // DIRECT ACTION BUTTONS - No dropdown needed!
    actionButtons: {
      display: 'flex',
      gap: '4px',
      position: 'absolute',
      top: '36px',
      right: '8px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      padding: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      padding: '6px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'background 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '24px',
      minHeight: '24px'
    },
    editButton: {
      color: '#3b82f6'
    },
    archiveButton: {
      color: '#f59e0b'
    },
    deleteButton: {
      color: '#ef4444'
    },
    // List view action buttons (inline)
    listActionButtons: {
      display: 'flex',
      gap: '4px'
    },
    listActionButton: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'background 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      minHeight: '20px'
    },
    quickStatusButtons: {
      display: 'flex',
      gap: '6px',
      marginTop: 'auto',
      paddingTop: '8px'
    },
    quickStatusButton: {
      padding: '6px 10px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: 0.7,
      flex: 1,
      textAlign: 'center'
    },
    quickStatusButtonActive: {
      opacity: 1,
      transform: 'scale(1.02)'
    },
    overdueIndicator: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: '#ef4444',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: '600',
      zIndex: 2
    },
    actionMenu: {
      position: 'absolute',
      top: view === 'list' ? '50%' : '36px',
      left: view === 'list' ? 'calc(100% + 32px)' : 'auto',
      right: view === 'list' ? 'auto' : '8px',
      transform: view === 'list' ? 'translateY(-50%)' : 'none',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      padding: '8px 0',
      zIndex: 9999,
      minWidth: '140px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      opacity: showActionMenu ? 1 : 0,
      pointerEvents: showActionMenu ? 'auto' : 'none',
      transition: 'opacity 0.3s',
    },
    actionMenuButton: {
      background: 'none',
      border: 'none',
      padding: '8px 16px',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.2s, color 0.2s',
      textAlign: 'left',
    },
  };

  const cardStyle = {
    ...(view === 'grid' ? styles.gridCard : styles.listCard),
    opacity: fadingOut ? 0 : 1,
    transition: 'opacity 0.5s',
    ...(archived ? { filter: 'grayscale(1)', background: '#f3f4f6', color: '#9ca3af', position: 'relative' } : {})
  };

  return (
    <>
      <div
        style={cardStyle}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = view === 'grid' ? 'translateY(-2px)' : 'translateY(-1px)';
          e.currentTarget.style.boxShadow = view === 'grid' 
            ? '0 12px 35px rgba(0, 0, 0, 0.15)' 
            : '0 8px 20px rgba(0, 0, 0, 0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = view === 'grid' 
            ? '0 8px 25px rgba(0, 0, 0, 0.08)' 
            : '0 4px 12px rgba(0, 0, 0, 0.05)';
        }}
      >
        {/* Overdue indicator */}
        {isOverdue && (
          <div style={styles.overdueIndicator}>
            OVERDUE
          </div>
        )}

        {/* DIRECT ACTION BUTTONS - Grid View */}
        {view === 'grid' && !archived && canEdit && (
          <div style={{ position: 'absolute', top: '36px', right: '8px', zIndex: 100 }}>
            <button
              style={{...styles.actionButton, fontSize: '20px'}}
              onClick={handleMenuOpen}
              title="Show actions"
            >
              ⋯
            </button>
            <div
              ref={menuRef}
              style={styles.actionMenu}
              onClick={e => e.stopPropagation()}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
            >
              <button
                style={{...styles.actionMenuButton, color: '#3b82f6'}}
                onClick={e => { handleEdit(e); setShowActionMenu(false); }}
                onMouseOver={e => e.target.style.background = '#eff6ff'}
                onMouseOut={e => e.target.style.background = 'none'}
              >
                ✏️ Edit
              </button>
              <button
                style={{
                  ...styles.actionMenuButton,
                  color: '#f59e0b',
                  borderRadius: '10px',
                  fontWeight: 600
                }}
                onClick={e => { handleArchive(e); setShowActionMenu(false); }}
                onMouseOver={e => e.target.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}
                onMouseOut={e => e.target.style.background = 'none'}
              >
                📦 Archive
              </button>
              <button
                style={{...styles.actionMenuButton, color: '#ef4444'}}
                onClick={e => { handleDelete(e); setShowActionMenu(false); }}
                onMouseOver={e => e.target.style.background = '#fef2f2'}
                onMouseOut={e => e.target.style.background = 'none'}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        )}

        {view === 'grid' ? (
          <>
            {/* Grid layout */}
            <div style={styles.header}>
              <h3 style={{
                ...styles.title,
                ...(task.status === 'completed' ? styles.titleCompleted : {}),
                paddingRight: '100px' // Make room for action buttons
              }}>
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p style={styles.description}>
                {task.description}
              </p>
            )}

            <div style={styles.statusSection}>
              <div style={{
                ...styles.statusBadge,
                background: getStatusColor(task.status)
              }}>
                <span>{getStatusIcon(task.status)}</span>
                <span>{getStatusDisplayName(task.status)}</span>
              </div>
              <div style={{
                ...styles.priorityBadge,
                background: getPriorityColor(task.priority)
              }}>
                <span>{getPriorityIcon(task.priority)}</span>
                <span>{getPriorityDisplayName(task.priority)}</span>
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div style={styles.tagsContainer}>
                {task.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={styles.footer}>
              <div style={styles.assignedTo}>
                <div style={styles.avatar}>
                  {task.assignedTo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
              {task.dueDate && (
                <div style={{
                  ...styles.dateInfo,
                  ...(isOverdue ? styles.dueDateOverdue : {}),
                  ...(isDueSoon ? styles.dueDateWarning : {})
                }}>
                  Due {formatDate(task.dueDate)}
                </div>
              )}
            </div>

            {/* Quick status change buttons */}
            {!archived && (
              <div style={styles.quickStatusButtons}>
                <button
                  style={{
                    ...styles.quickStatusButton,
                    background: getStatusColor('todo'),
                    color: 'white',
                    ...(task.status === 'todo' ? styles.quickStatusButtonActive : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('todo');
                  }}
                >
                  To Do
                </button>
                <button
                  style={{
                    ...styles.quickStatusButton,
                    background: getStatusColor('in-progress'),
                    color: 'white',
                    ...(task.status === 'in-progress' ? styles.quickStatusButtonActive : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('in-progress');
                  }}
                >
                  In Progress
                </button>
                <button
                  style={{
                    ...styles.quickStatusButton,
                    background: getStatusColor('completed'),
                    color: 'white',
                    ...(task.status === 'completed' ? styles.quickStatusButtonActive : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('completed');
                  }}
                >
                  Completed
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* List layout */}
            <div style={styles.listHeader}>
              <h3 style={{
                ...styles.title,
                ...(task.status === 'completed' ? styles.titleCompleted : {})
              }}>
                {task.title}
              </h3>
              <div style={styles.listContent}>
                <div style={styles.listMetaRow}>
                  <div style={{
                    ...styles.statusBadge,
                    background: getStatusColor(task.status)
                  }}>
                    <span>{getStatusIcon(task.status)}</span>
                    <span>{getStatusDisplayName(task.status)}</span>
                  </div>
                  <div style={{
                    ...styles.priorityBadge,
                    background: getPriorityColor(task.priority)
                  }}>
                    <span>{getPriorityIcon(task.priority)}</span>
                    <span>{getPriorityDisplayName(task.priority)}</span>
                  </div>
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div style={styles.tagsContainer}>
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span style={{...styles.tag, background: '#f3f4f6', color: '#6b7280'}}>
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {/* Status change buttons in list view */}
                {!archived && (
                  <div style={styles.quickStatusButtons}>
                    <button
                      style={{
                        ...styles.quickStatusButton,
                        background: getStatusColor('todo'),
                        color: 'white',
                        ...(task.status === 'todo' ? styles.quickStatusButtonActive : {})
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('todo');
                      }}
                    >
                      To Do
                    </button>
                    <button
                      style={{
                        ...styles.quickStatusButton,
                        background: getStatusColor('in-progress'),
                        color: 'white',
                        ...(task.status === 'in-progress' ? styles.quickStatusButtonActive : {})
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('in-progress');
                      }}
                    >
                      In Progress
                    </button>
                    <button
                      style={{
                        ...styles.quickStatusButton,
                        background: getStatusColor('completed'),
                        color: 'white',
                        ...(task.status === 'completed' ? styles.quickStatusButtonActive : {})
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange('completed');
                      }}
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.listFooter}>
              <div style={styles.assignedTo}>
                <div style={styles.avatar}>
                  {task.assignedTo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
              {task.dueDate && (
                <div style={{
                  ...styles.dateInfo,
                  ...(isOverdue ? styles.dueDateOverdue : {}),
                  ...(isDueSoon ? styles.dueDateWarning : {})
                }}>
                  Due {formatDate(task.dueDate)}
                </div>
              )}
              
              {/* DIRECT ACTION BUTTONS - List View */}
              {!archived && canEdit && (
                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                  <button
                    style={{...styles.actionButton, fontSize: '20px'}}
                    onClick={handleMenuOpen}
                    title="Show actions"
                  >
                    ⋯
                  </button>
                  <div
                    ref={menuRef}
                    style={styles.actionMenu}
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={() => setIsMenuHovered(true)}
                    onMouseLeave={() => setIsMenuHovered(false)}
                  >
                    <button
                      style={{...styles.actionMenuButton, color: '#3b82f6'}}
                      onClick={e => { handleEdit(e); setShowActionMenu(false); }}
                      onMouseOver={e => e.target.style.background = '#eff6ff'}
                      onMouseOut={e => e.target.style.background = 'none'}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{
                        ...styles.actionMenuButton,
                        color: '#f59e0b',
                        borderRadius: '10px',
                        fontWeight: 600
                      }}
                      onClick={e => { handleArchive(e); setShowActionMenu(false); }}
                      onMouseOver={e => e.target.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}
                      onMouseOut={e => e.target.style.background = 'none'}
                    >
                      📦 Archive
                    </button>
                    <button
                      style={{...styles.actionMenuButton, color: '#ef4444'}}
                      onClick={e => { handleDelete(e); setShowActionMenu(false); }}
                      onMouseOver={e => e.target.style.background = '#fef2f2'}
                      onMouseOut={e => e.target.style.background = 'none'}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {archived && (
          <>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(156,163,175,0.4)',
              borderRadius: view === 'grid' ? '16px' : '12px',
              zIndex: 2
            }} />
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: '#9ca3af',
              color: 'white',
              borderRadius: '8px',
              padding: '2px 10px',
              fontWeight: 700,
              fontSize: '12px',
              zIndex: 3
            }}>
              ARCHIVED
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, zIndex: 3, position: 'relative', justifyContent: 'flex-end' }}>
              <button
                style={{
                  ...baseActionButton,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white'
                }}
                onClick={handleRestore}
                onMouseOver={e => e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'}
                onMouseOut={e => e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'}
              >
                Restore
              </button>
              <button
                style={{
                  ...baseActionButton,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white'
                }}
                onClick={handleDeletePermanent}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full-screen loading overlay */}
      {showLoadingOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <TaskForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => { setShowEditForm(false); if (onTaskEditSuccess) onTaskEditSuccess(); }}
          task={task}
          mode="edit"
          teamMembers={teamMembers}
        />
      )}

      {/* Confirmation Dialog for Delete (active and archived) */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
      {/* Confirmation Dialog for Restore (archived) */}
      <ConfirmationDialog
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={confirmRestore}
        title="Restore Task"
        message={`Are you sure you want to restore "${task.title}"?`}
        confirmText="Restore"
        type="info"
      />
      {/* Confirmation Dialog for Archive */}
      <ConfirmationDialog
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchiveTask}
        title="Archive Task"
        message={`Are you sure you want to archive "${task.title}"? You can restore it later from the archived tasks.`}
        confirmText="Archive"
        type="warning"
      />
    </>
  );
};

export default TaskCard;

<style jsx>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>