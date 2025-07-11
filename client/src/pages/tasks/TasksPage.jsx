/*
  TasksPage.jsx
  Main personal tasks page for TaskTracker+.
  - Allows users to view, filter, and manage their personal tasks.
  - Integrates with Redux for state management and backend API for data sync.
  - Supports task creation, editing, archiving, and analytics.
*/
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getTasks, setFilters, clearFilters, deleteTask, getTaskStats, getArchivedTasks } from '../../store/slices/taskSlice';
import { logout } from '../../store/slices/authSlice';
import TaskForm from '../../components/tasks/TaskForm';
import TaskCard from '../../components/tasks/TaskCard';
import Navbar from '../../components/common/Navbar';
import { useTheme } from '../../ThemeContext.jsx';

const TasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tasks,
    isLoading,
    error,
    pagination,
    filters,
    stats
  } = useSelector((state) => state.tasks);
  
  const { user } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [openDropdownTaskId, setOpenDropdownTaskId] = useState(null);
  const [selectedStatusBox, setSelectedStatusBox] = useState(null);
  const [fadedOutTaskIds, setFadedOutTaskIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedStatusFilter, setArchivedStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🔥 NEW: Get colors for different statuses
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#6b7280';      // Grey
      case 'in-progress': return '#2563eb'; // Blue
      case 'completed': return '#10b981';   // Green
      case 'overdue': return '#ef4444';     // Red
      default: return '#6b7280';
    }
  };

  // 🔥 NEW: Get current filter display info
  const getCurrentFilterInfo = () => {
    if (filters.overdue) {
      return { text: '- OVERDUE', color: getStatusColor('overdue') };
    } else if (filters.status) {
      const statusText = filters.status.replace('-', ' ').toUpperCase();
      return { 
        text: `- ${statusText}`, 
        color: getStatusColor(filters.status) 
      };
    }
    return null;
  };

  const filterInfo = getCurrentFilterInfo();

  // 🔥 SIMPLIFIED: Handle URL changes and API calls in one effect
  useEffect(() => {
    if (showArchived) {
      dispatch(getArchivedTasks({})); // Always fetch all archived tasks
    } else {
      const params = new URLSearchParams(location.search);
      const status = params.get('status') || '';
      const overdue = params.get('overdue') === 'true';
      const shouldCreate = params.get('create') === 'true';
      
      // 🔥 NEW: Auto-open create modal if create=true in URL
      if (shouldCreate) {
        setShowCreateForm(true);
        // Clean the URL to prevent modal from reopening on refresh
        navigate('/tasks', { replace: true });
        return; // Exit early for create modal
      }
      
      // 🔥 CRITICAL FIX: Build completely fresh filters
      const freshFilters = {
        view: 'personal',
        status: overdue ? '' : status,
        priority: '',
        assignedTo: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        overdue: overdue,
        includeArchived: false,
        page: 1
      };
      
      // Set filters and fetch data immediately with the new filters
      dispatch(setFilters(freshFilters));
      dispatch(getTasks(freshFilters)); // Use freshFilters directly instead of Redux state
      dispatch(getTaskStats());
    }
  }, [showArchived, dispatch, navigate, location.search]);

  useEffect(() => {
    setFadedOutTaskIds([]);
  }, [location.search]);

  useEffect(() => {
    // If navigated from dashboard with showArchived, set showArchived state
    if (location.state && location.state.showArchived) {
      setShowArchived(true);
      // Optionally clear the state so it doesn't persist on further navigation
      navigate('/tasks', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 🔥 IMPROVED: Manual filter changes (from dropdowns/inputs)
  const handleFilterChange = (newFilters) => {
    // Clear URL params to avoid conflicts
    navigate('/tasks', { replace: true });
    // Merge new filters with current filters
    const mergedFilters = {
      ...filters,
      ...newFilters,
      page: 1 // Always reset to first page on filter change
    };
    dispatch(setFilters(mergedFilters));
    dispatch(getTasks(mergedFilters));
    dispatch(getTaskStats());
  };

  const handleClearFilters = () => {
    navigate('/tasks', { replace: true }); // Clear URL
    const defaultFilters = {
      view: 'personal',
      status: '',
      priority: '',
      assignedTo: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      overdue: false,
      includeArchived: false,
      page: 1
    };
    
    dispatch(setFilters(defaultFilters));
    dispatch(getTasks(defaultFilters)); // Use fresh filters directly
    dispatch(getTaskStats());
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId)).then(() => {
        // Refresh data after delete
        refreshData();
      });
    }
  };

  // 🔥 NEW: Function to refresh data after task operations
  const refreshData = () => {
    if (showArchived) {
      dispatch(getArchivedTasks({})); // Refresh all archived tasks and stats
    } else {
      dispatch(getTasks({ ...filters, view: 'personal' }));
      dispatch(getTaskStats());
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

  const handleStatusBoxClick = (status) => {
    setSelectedStatusBox(status);
    if (status === null) {
      navigate('/tasks');
    } else if (status === 'overdue') {
      navigate('/tasks?overdue=true');
    } else {
      navigate(`/tasks?status=${status}`);
    }
  };

  const handleTaskFadeOut = (taskId) => {
    setFadedOutTaskIds(ids => [...ids, taskId]);
  };

  // Helper to get status count from stats.stats array (active)
  const getStatusCount = (statusId) => {
    if (!stats || !stats.stats) return 0;
    const found = stats.stats.find(s => s._id === statusId);
    return found ? found.count : 0;
  };

  // Helper to get status count from archivedTasks (archived)
  const getArchivedStatusCount = (statusId) => {
    if (!archivedTasks) return 0;
    if (statusId === 'overdue') {
      return archivedTasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    }
    return archivedTasks.filter(t => t.status === statusId).length;
  };

  // Only fade out tasks when a status filter is active
  const isFilteredByStatus = filters.status || filters.overdue;

  const archivedTasks = useSelector((state) => state.tasks.archivedTasks);

  // --- Archived Stats: Always Global ---
  const archivedStats = {
    total: archivedTasks.length,
    todo: archivedTasks.filter(t => t.status === 'todo').length,
    inProgress: archivedTasks.filter(t => t.status === 'in-progress').length,
    completed: archivedTasks.filter(t => t.status === 'completed').length,
    overdue: archivedTasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length,
  };

  // --- Displayed List: Only This is Filtered ---
  const displayedTasks = showArchived
    ? archivedTasks.filter(task => {
        if (task.team) return false; // Exclude team tasks from personal archived view
        if (!archivedStatusFilter) return true;
        if (archivedStatusFilter === 'overdue') {
          return task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date();
        }
        return task.status === archivedStatusFilter;
      })
    : tasks.filter(task => {
        if (filters.overdue) {
          return task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date();
        }
        if (filters.status) {
          return task.status === filters.status;
        }
        return true;
      });

  // Sync archivedStatusFilter with URL
  useEffect(() => {
    if (showArchived) {
      const params = new URLSearchParams(location.search);
      const status = params.get('status') || '';
      setArchivedStatusFilter(status);
    }
  }, [location.search, showArchived]);

  // Handler for archived stat card clicks
  const handleArchivedStatusBoxClick = (status) => {
    if (!status) {
      navigate('/tasks?archived=true');
    } else if (status === 'overdue') {
      navigate('/tasks?archived=true&status=overdue');
    } else {
      navigate(`/tasks?archived=true&status=${status}`);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    navbar: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    },
    navContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    brandText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    enterpriseText: {
      fontSize: '11px',
      color: '#64748b',
      fontWeight: '500',
      margin: 0
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: '#475569',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    navLinkActive: {
      color: '#2563eb',
      fontWeight: '600',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '2px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    userRole: {
      fontSize: '12px',
      color: '#64748b',
      margin: 0
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    logoutBtn: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      padding: '24px 0',
      position: 'sticky',
      top: '64px',
      zIndex: 40
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    titleIcon: {
      fontSize: '28px'
    },
    headerActions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    createButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.2s ease',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    viewToggle: {
      display: 'flex',
      background: 'none',
      borderRadius: '8px',
      padding: '4px',
      border: '1px solid #e5e7eb'
    },
    viewButton: {
      padding: '8px 12px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    viewButtonActive: {
      background: '#2563eb',
      color: 'white'
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
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
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
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
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
      background: 'none'
    },
    filterInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    clearFiltersButton: {
      background: 'none',
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
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '40px auto'
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
      background: 'none',
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

  return (
    <div className="tasks-root min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar user={user} handleLogout={handleLogout} />
      {/* Main Content */}
      <div style={styles.main}>
        {/* Stats - Live Updates with Color Coding */}
        <div style={styles.statsGrid}>
          {showArchived ? (
            <>
              <div style={{ ...styles.statCard, cursor: 'pointer', border: `1.5px solid ${borderColor}` }} onClick={() => handleArchivedStatusBoxClick('')}>
                <div style={styles.statLabel}>Archived Tasks</div>
                <div style={styles.statValue}>{archivedTasks.length}</div>
              </div>
              <div style={{ ...styles.statCard, cursor: 'pointer', border: `1.5px solid ${borderColor}` }} onClick={() => handleArchivedStatusBoxClick('todo')}>
                <div style={styles.statLabel}>To Do (Archived)</div>
                <div style={{ ...styles.statValue, color: getStatusColor('todo') }}>{getArchivedStatusCount('todo')}</div>
              </div>
              <div style={{ ...styles.statCard, cursor: 'pointer', border: `1.5px solid ${borderColor}` }} onClick={() => handleArchivedStatusBoxClick('in-progress')}>
                <div style={styles.statLabel}>In Progress (Archived)</div>
                <div style={{ ...styles.statValue, color: getStatusColor('in-progress') }}>{getArchivedStatusCount('in-progress')}</div>
              </div>
              <div style={{ ...styles.statCard, cursor: 'pointer', border: `1.5px solid ${borderColor}` }} onClick={() => handleArchivedStatusBoxClick('completed')}>
                <div style={styles.statLabel}>Completed (Archived)</div>
                <div style={{ ...styles.statValue, color: getStatusColor('completed') }}>{getArchivedStatusCount('completed')}</div>
              </div>
              <div style={{ ...styles.statCard, cursor: 'pointer', border: `1.5px solid ${borderColor}` }} onClick={() => handleArchivedStatusBoxClick('overdue')}>
                <div style={styles.statLabel}>Overdue (Archived)</div>
                <div style={{ ...styles.statValue, color: getStatusColor('overdue') }}>{getArchivedStatusCount('overdue')}</div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{ ...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}` }}
                onClick={() => navigate('/tasks')}
              >
                <div style={styles.statLabel}>Total Tasks</div>
                <div style={styles.statValue}>{stats.total || 0}</div>
              </div>
              <div
                style={{ ...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}` }}
                onClick={() => navigate('/tasks?status=todo')}
              >
                <div style={styles.statLabel}>To Do</div>
                <div style={{ ...styles.statValue, color: getStatusColor('todo') }}>{getStatusCount('todo')}</div>
              </div>
              <div
                style={{ ...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}` }}
                onClick={() => navigate('/tasks?status=in-progress')}
              >
                <div style={styles.statLabel}>In Progress</div>
                <div style={{ ...styles.statValue, color: getStatusColor('in-progress') }}>{getStatusCount('in-progress')}</div>
              </div>
              <div
                style={{ ...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}` }}
                onClick={() => navigate('/tasks?status=completed')}
              >
                <div style={styles.statLabel}>Completed</div>
                <div style={{ ...styles.statValue, color: getStatusColor('completed') }}>{getStatusCount('completed')}</div>
              </div>
              <div
                style={{ ...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}` }}
                onClick={() => navigate('/tasks?overdue=true')}
              >
                <div style={styles.statLabel}>Overdue</div>
                <div style={{ ...styles.statValue, color: getStatusColor('overdue') }}>{stats.overdue || 0}</div>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div style={{ ...styles.filtersSection, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                style={styles.filterSelect}
                value={filters.overdue ? 'overdue' : filters.status}
                onChange={(e) => {
                  if (e.target.value === 'overdue') {
                    handleFilterChange({ status: '', overdue: true });
                  } else {
                    handleFilterChange({ status: e.target.value, overdue: false });
                  }
                }}
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Priority</label>
              <select
                style={styles.filterSelect}
                value={filters.priority}
                onChange={(e) => handleFilterChange({ priority: e.target.value })}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <input
                style={styles.filterInput}
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                style={styles.filterSelect}
                value={filters.overdue ? 'overdue-asc' : `${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  if (sortBy === 'overdue') {
                    handleFilterChange({ sortBy: 'dueDate', sortOrder: 'asc', overdue: true });
                  } else {
                    handleFilterChange({ sortBy, sortOrder, overdue: false });
                  }
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="dueDate-asc">Due Date (Oldest First)</option>
                <option value="dueDate-desc">Due Date (Latest First)</option>
                <option value="priority-desc">High Priority</option>
                <option value="title-asc">Title A-Z</option>
              </select>
            </div>
          </div>
          {/* Action buttons row below filters */}
          <div style={{ display: 'flex', gap: '12px', marginTop: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              style={{ ...styles.clearFiltersButton, minWidth: 110 }}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
              {!showArchived && (
                <button
                  style={{ ...styles.createButton, minWidth: 120, padding: '8px 16px', fontSize: '14px' }}
                  onClick={() => setShowCreateForm(true)}
                >
                  ➕ Create Task
                </button>
              )}
              <button
                style={{ ...styles.createButton, minWidth: 120, padding: '8px 16px', fontSize: '14px' }}
                onClick={() => setShowArchived((prev) => !prev)}
              >
                {showArchived ? 'Show Active Tasks' : 'Show Archived Tasks'}
              </button>
              <div style={{ ...styles.viewToggle, minWidth: 120, maxWidth: 180 }}>
                <button
                  style={{
                    ...styles.viewButton,
                    ...(view === 'grid' ? styles.viewButtonActive : {}),
                    width: '50%'
                  }}
                  onClick={() => setView('grid')}
                >
                  🟦 Grid
                </button>
                <button
                  style={{
                    ...styles.viewButton,
                    ...(view === 'list' ? styles.viewButtonActive : {}),
                    width: '50%'
                  }}
                  onClick={() => setView('list')}
                >
                  📋 List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Tasks */}
        <div style={styles.tasksContainer}>
          {displayedTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>{showArchived ? 'No archived tasks found.' : 'No tasks found'}</h3>
              {!showArchived && (
                <>
                  <p style={styles.emptyText}>
                    {Object.keys(filters).some(key => filters[key] && key !== 'sortBy' && key !== 'sortOrder' && key !== 'includeArchived') 
                      ? 'Try adjusting your filters or create a new task.'
                      : 'Create your first task to get started!'
                    }
                  </p>
                  <button
                    style={{ ...baseActionButton, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}
                    onClick={() => setShowCreateForm(true)}
                  >
                    ➕ Create Your First Task
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={view === 'grid' ? styles.tasksGrid : styles.tasksList}>
              {displayedTasks
                .filter(task => !(isFilteredByStatus && fadedOutTaskIds.includes(task._id)))
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDelete={handleDeleteTask}
                    view={view}
                    showActions={openDropdownTaskId === task._id}
                    setShowActions={(open) => setOpenDropdownTaskId(open ? task._id : null)}
                    onUpdate={refreshData}
                    onFadeOut={handleTaskFadeOut}
                    isArchived={showArchived}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...baseActionButton,
                opacity: pagination.hasPrev ? 1 : 0.5,
                cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
              }}
              disabled={!pagination.hasPrev}
              onClick={() => handleFilterChange({ page: pagination.currentPage - 1 })}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              style={{
                ...baseActionButton,
                opacity: pagination.hasNext ? 1 : 0.5,
                cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
              }}
              disabled={!pagination.hasNext}
              onClick={() => handleFilterChange({ page: pagination.currentPage + 1 })}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <TaskForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            setSuccessMessage('Task created!');
            refreshData();
            setTimeout(() => setSuccessMessage(''), 2000);
          }}
        />
      )}

      {successMessage && (
        <div style={{position:'fixed',top:80,right:40,zIndex:1000,background:'#10b981',color:'white',padding:'16px 32px',borderRadius:12,boxShadow:'0 4px 24px rgba(16,185,129,0.18)',fontWeight:600,fontSize:16}}>
          {successMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TasksPage;