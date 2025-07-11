/*
  TeamTasksTab.jsx
  Tab component for displaying and managing team tasks in TaskTracker+.
  - Shows all tasks for the selected team with filtering and assignment.
  - Integrates with Redux and backend API for real-time team task management.
  - Supports admin/owner actions and analytics for team productivity.
*/
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TaskCard from '../tasks/TaskCard';
import CreateTeamTaskModal from '../tasks/CreateTeamTaskModal';
import { getTeamTasks, clearTeamTasks } from '../../store/slices/taskAssignmentSlice';
import { canManageTeamTasks, isTeamOwner, isTeamAdmin } from '../../utils/roleValidation';
import api from '../../services/api'; // Added import for api
import { useTheme } from '../../ThemeContext.jsx';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue'
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

const TeamTasksTab = () => {
  const dispatch = useDispatch();
  const { currentTeam, teams } = useSelector(state => state.teams);
  const team = teams.find(t => t._id === currentTeam._id);
  const { teamTasks, isLoadingTeamTasks, error } = useSelector(state => state.taskAssignment);
  const user = useSelector(state => state.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Add state for filters, sort, and pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('grid');
  const [activeTab, setActiveTab] = useState('active');
  const [statusCounts, setStatusCounts] = useState({ todo: 0, 'in-progress': 0, completed: 0, overdue: 0 });
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  // Remove localTasks, fadingTaskIds, and any local filtering/slicing
  // Use paginatedTasks (from backend) directly for rendering
  // Use totalTasks and totalPages from backend for pagination and stats
  // Status counts are calculated from paginatedTasks
  // Modal onSuccess triggers handleCreateTaskAndRefresh

  // Fetch status counts for all tasks (without pagination)
  const fetchStatusCounts = async () => {
    if (!currentTeam || !currentTeam._id) return;
    try {
      // Only fetch active tasks for status counts
      const response = await api.get(`/tasks/team/${currentTeam._id}?limit=1000&archived=false`);
      const allTasks = response.data.tasks || [];
      
      // Set total tasks count (static, doesn't change with filters)
      setTotalTasksCount(allTasks.length);
      
      // Calculate counts including overdue tasks
      const counts = allTasks.reduce(
        (acc, t) => {
          // Check if task is overdue (not completed and past due date)
          const isOverdue = t.status !== 'completed' && 
                           t.dueDate && 
                           new Date(t.dueDate) < new Date();
          
          if (isOverdue) {
            acc.overdue = (acc.overdue || 0) + 1;
          } else {
            acc[t.status] = (acc[t.status] || 0) + 1;
          }
          return acc;
        },
        { todo: 0, 'in-progress': 0, completed: 0, overdue: 0 }
      );
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  // Fetch tasks from backend
  const fetchTeamTasks = async () => {
    if (!currentTeam || !currentTeam._id) return;
    const params = new URLSearchParams();
    
    // Add archived filter based on activeTab
    if (activeTab === 'archived') {
      params.append('archived', 'true');
    } else {
      params.append('archived', 'false');
    }
    
    if (statusFilter) params.append('status', statusFilter);
    if (assigneeFilter) params.append('assignedTo', assigneeFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (searchFilter) params.append('search', searchFilter);
    if (sortBy) {
      const [field, order] = sortBy.split('-');
      params.append('sortBy', field);
      params.append('sortOrder', order);
    }
    params.append('page', page);
    params.append('limit', pageSize);
    try {
      const response = await api.get(`/tasks/team/${currentTeam._id}?${params.toString()}`);
      setTasks(response.data.tasks || []);
      setTotalTasks(response.data.pagination?.totalTasks || 0);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching team tasks:', err);
    }
  };

  // Fetch tasks from backend whenever filters/sort/page change
  useEffect(() => {
    fetchTeamTasks();
  }, [currentTeam, activeTab, statusFilter, assigneeFilter, priorityFilter, searchFilter, sortBy, page]);

  // Fetch status counts when team changes or when tasks are updated
  useEffect(() => {
    fetchStatusCounts();
  }, [currentTeam]);

  // Refresh status counts periodically to handle overdue tasks
  useEffect(() => {
    if (!currentTeam || !currentTeam._id) return;
    
    const interval = setInterval(() => {
      fetchStatusCounts();
    }, 60000); // Refresh every minute to catch overdue tasks
    
    return () => clearInterval(interval);
  }, [currentTeam]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, assigneeFilter, priorityFilter, searchFilter, sortBy]);

  // After creating a task, reset to page 1 and fetch
  const handleCreateTaskAndRefresh = async (taskData) => {
    // The CreateTeamTaskModal will handle the actual API call
    // This function just handles the refresh after creation
    setSortBy('createdAt-desc');
    setPage(1);
    // Refresh both current page data and status counts
    await fetchTeamTasks();
    await fetchStatusCounts();
  };

  // Filtering, search, sorting, and pagination
  // Use backend pagination only
  const paginatedTasks = tasks;
  // Now filter for display
  let filteredTasks = activeTab === 'active' ? tasks : tasks;
  if (statusFilter) filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
  if (assigneeFilter) filteredTasks = filteredTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === assigneeFilter);
  if (priorityFilter) filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
  if (searchFilter) filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchFilter.toLowerCase()));
  if (sortBy) {
    const [sortField, sortOrder] = sortBy.split('-');
    filteredTasks = [...filteredTasks].sort((a, b) => {
      if (sortField === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] - priorityOrder[a.priority]) * (sortOrder === 'asc' ? -1 : 1);
      } else if (sortField === 'title') {
        return a.title.localeCompare(b.title) * (sortOrder === 'asc' ? 1 : -1);
      } else {
        const aValue = new Date(a[sortField]);
        const bValue = new Date(b[sortField]);
        return (aValue - bValue) * (sortOrder === 'asc' ? 1 : -1);
      }
    });
  }
  // const totalPages = Math.ceil(filteredTasks.length / pageSize); // This is now managed by backend
  // const paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize); // This is now managed by backend

  // Modern styles copied from TaskManager.jsx
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: '24px',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    filtersSection: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    },
    filterInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    clearFiltersButton: {
      background: 'white',
      border: '2px solid #2563eb',
      color: '#2563eb',
      padding: '8px 18px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
      transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s',
    },
    tasksContainer: {
      marginTop: '24px'
    },
    tasksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    tasksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 32px'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    emptyText: {
      color: '#64748b',
      marginBottom: '24px'
    },
    errorMessage: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      marginTop: '32px'
    },
    pageButton: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    pageButtonActive: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    pageInfo: {
      fontSize: '14px',
      color: '#6b7280'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#6b7280';      // Grey
      case 'in-progress': return '#2563eb'; // Blue
      case 'completed': return '#10b981';   // Green
      case 'overdue': return '#ef4444';     // Red
      default: return '#6b7280';
    }
  };

  // Add baseActionButton style for pagination buttons
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

  const userId = user?.id || user?._id || user?.userId;
  const userRole = team?.members?.find(m => (m.userId?._id || m.userId) === userId)?.role;
  const canCreate = userRole === 'admin' || userRole === 'owner';
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        {/* Tab Switch Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{
              ...styles.clearFiltersButton,
              background: activeTab === 'active' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'white',
              color: activeTab === 'active' ? 'white' : '#2563eb',
              fontWeight: 600,
              border: activeTab === 'active' ? 'none' : '2px solid #2563eb',
              minWidth: 140
            }}
            onClick={() => setActiveTab('active')}
          >
            Active Tasks
          </button>
          <button
            style={{
              ...styles.clearFiltersButton,
              background: activeTab === 'archived' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
              color: activeTab === 'archived' ? 'white' : '#059669',
              fontWeight: 600,
              border: activeTab === 'archived' ? 'none' : '2px solid #10b981',
              minWidth: 140
            }}
            onClick={() => setActiveTab('archived')}
          >
            Archived Tasks
          </button>
        </div>
        {/* Stats Grid with Total Tasks Card */}
        <div style={styles.statsGrid}>
          {activeTab === 'active' && (
            <>
              {/* Total Tasks Card */}
              <div
                style={{
                  ...styles.statCard,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  border: statusFilter === '' ? '2px solid #2563eb' : `1.5px solid ${borderColor}`
                }}
                onClick={() => setStatusFilter('')}
              >
                <span style={{ fontSize: 28 }}>📋</span>
                <div>
                  <div style={styles.statLabel}>Total Tasks</div>
                  <div style={{ ...styles.statValue, color: '#2563eb' }}>{totalTasksCount}</div>
                </div>
              </div>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div
                  key={status}
                  style={{
                    ...styles.statCard,
                    cursor: 'pointer',
                    border: statusFilter === status ? '2px solid #2563eb' : `1.5px solid ${borderColor}`
                  }}
                  onClick={() => setStatusFilter(status)}
                >
                  <div style={styles.statLabel}>{label}</div>
                  <div style={{ ...styles.statValue, color: getStatusColor(status) }}>{statusCounts[status] || 0}</div>
                </div>
              ))}
            </>
          )}
          {activeTab === 'archived' && (
            <div
              style={{
                ...styles.statCard,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                border: statusFilter === '' ? '2px solid #10b981' : `1.5px solid ${borderColor}`
              }}
              onClick={() => setStatusFilter('')}
            >
              <span style={{ fontSize: 28 }}>📦</span>
              <div>
                <div style={styles.statLabel}>Archived Tasks</div>
                <div style={{ ...styles.statValue, color: '#10b981' }}>{totalTasks}</div>
              </div>
            </div>
          )}
        </div>
        {/* Filters, Search, Sort, View Toggle */}
        <div style={{ ...styles.filtersSection, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select style={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Assignee</label>
              <select style={styles.filterSelect} value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
                <option value="">All Assignees</option>
                {team?.members?.map(m => (
                  <option key={m.userId?._id || m.userId} value={m.userId?._id || m.userId}>
                    {m.userId?.name || m.name || m.email}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Priority</label>
              <select style={styles.filterSelect} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <input style={styles.filterInput} type="text" placeholder="Search tasks..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select style={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="dueDate-asc">Due Date (Oldest First)</option>
                <option value="dueDate-desc">Due Date (Latest First)</option>
                <option value="priority-desc">High Priority</option>
                <option value="title-asc">Title A-Z</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>View</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...styles.pageButton, ...(view === 'grid' ? styles.pageButtonActive : {}) }} onClick={() => setView('grid')}>Grid</button>
                <button style={{ ...styles.pageButton, ...(view === 'list' ? styles.pageButtonActive : {}) }} onClick={() => setView('list')}>List</button>
              </div>
            </div>
            {canCreate && (
              <button
                style={{
                  ...styles.clearFiltersButton,
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  width: '100%',
                  height: 44,
                  marginTop: 0,
                  marginBottom: 8
                }}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Task
              </button>
            )}
            <button
              style={{
                ...styles.clearFiltersButton,
                background: '#2563eb',
                color: 'white',
                fontWeight: 600,
                border: 'none',
                width: '100%',
                height: 44,
                marginTop: 0
              }}
              onClick={() => {
                setStatusFilter('');
                setAssigneeFilter('');
                setPriorityFilter('');
                setSearchFilter('');
                setSortBy('createdAt-desc');
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        {/* Error */}
        {error && <div style={styles.errorMessage}>{error}</div>}
        {/* Tasks List */}
        <div style={styles.tasksContainer}>
          {paginatedTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>{activeTab === 'active' ? '📝' : '📦'}</div>
              <h3 style={styles.emptyTitle}>{activeTab === 'active' ? 'No tasks found' : 'No archived tasks found'}</h3>
              <p style={styles.emptyText}>
                {statusFilter || assigneeFilter || priorityFilter || searchFilter
                  ? 'Try adjusting your filters or create a new task.'
                  : 'Create your first task to get started!'}
              </p>
            </div>
          ) : (
            <div style={view === 'grid' ? styles.tasksGrid : styles.tasksList}>
              {paginatedTasks.map(task => (
                <div
                  key={task._id}
                  style={{ opacity: 1, transition: 'opacity 0.5s', border: `1.5px solid ${borderColor}`, borderRadius: 16, background: theme === 'dark' ? '#18181b' : '#fff' }}
                >
                  <TaskCard
                    task={task}
                    view={view}
                    isArchived={!!task.isArchived}
                    userRole={userRole}
                    onFadeOut={() => {}} // No fading effect for backend-driven tasks
                    onDelete={() => {
                      // Refresh both current page data and status counts
                      const fetchData = async () => {
                        await fetchTeamTasks();
                        await fetchStatusCounts();
                      };
                      fetchData();
                    }}
                    onUpdate={() => {
                      // Refresh both current page data and status counts
                      const fetchData = async () => {
                        await fetchTeamTasks();
                        await fetchStatusCounts();
                      };
                      fetchData();
                    }}
                    onTaskEditSuccess={() => {
                      // Refresh both current page data and status counts
                      const fetchData = async () => {
                        await fetchTeamTasks();
                        await fetchStatusCounts();
                      };
                      fetchData();
                    }}
                    teamMembers={team?.members}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...baseActionButton,
                opacity: page > 1 ? 1 : 0.5,
                cursor: page > 1 ? 'pointer' : 'not-allowed'
              }}
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              style={{
                ...baseActionButton,
                opacity: page < totalPages ? 1 : 0.5,
                cursor: page < totalPages ? 'pointer' : 'not-allowed'
              }}
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
        <CreateTeamTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          selectedTeamId={currentTeam._id}
          canCreate={canCreate}
          onSuccess={handleCreateTaskAndRefresh}
        />
      </div>
    </div>
  );
};

export default TeamTasksTab; 