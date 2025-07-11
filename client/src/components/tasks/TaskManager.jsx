/*
  TaskManager.jsx
  Main task management component for TaskTracker+.
  - Handles fetching, filtering, and displaying tasks for personal and team views.
  - Supports task creation, editing, archiving, and assignment.
  - Integrates with Redux for state management and API for backend sync.
*/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTeamTasks
} from '../../store/slices/taskAssignmentSlice';
import EnhancedTaskCard from './EnhancedTaskCard';
import api from '../../services/api';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue'
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8f4f8 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
    background: 'rgba(255, 255, 255, 0.9)',
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

const TaskManager = ({ team }) => {
  const dispatch = useDispatch();
  const {
    teamTasks,
    isLoadingTeamTasks,
    error: reduxError
  } = useSelector(state => state.taskAssignment);
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const pageSize = 9; // Show 9 tasks per page as requested
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamView, setIsTeamView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/tasks';
        let params = new URLSearchParams();
        
        if (team) {
          url = `/api/tasks/teams/${team._id}`;
        } else {
          url = '/api/tasks';
        }

        // Add filters to params
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

        const response = await api.get(`${url}?${params.toString()}`);
        
        setTasks(response.data.tasks || []);
        setTotalTasks(response.data.pagination?.totalTasks || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [team, statusFilter, assigneeFilter, priorityFilter, searchFilter, sortBy, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, assigneeFilter, priorityFilter, searchFilter, sortBy]);

  // Apply filters to the fetched tasks
  let filteredTasks = [...tasks];
  
  if (statusFilter) {
    filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
  }
  if (assigneeFilter) {
    filteredTasks = filteredTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === assigneeFilter);
  }
  if (priorityFilter) {
    filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
  }
  if (searchFilter) {
    filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchFilter.toLowerCase()));
  }
  if (sortBy) {
    const [sortField, sortOrder] = sortBy.split('-');
    filteredTasks = [...filteredTasks].sort((a, b) => {
      if (sortField === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
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
  
  // Use backend pagination if available, otherwise use frontend pagination
  let paginatedTasks;
  
  if (totalPages > 1) {
    // Backend pagination is available
    paginatedTasks = filteredTasks; // Tasks are already paginated from backend
  } else {
    // Fallback to frontend pagination
    const calculatedTotalPages = Math.ceil(filteredTasks.length / pageSize);
    setTotalPages(calculatedTotalPages);
    paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);
  }
  const statusCounts = filteredTasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    { todo: 0, 'in-progress': 0, completed: 0, overdue: 0 }
  );

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      let response;
      
      if (isTeamView && selectedTeam) {
        
        response = await api.post(`/api/tasks/teams/${selectedTeam._id}`, taskData);
      } else {
        
        response = await api.post('/api/tasks', taskData);
      }

      const newTask = response.data;
      
      // Add the new task to the current list
      setTasks(prevTasks => {
        const updatedTasks = [newTask, ...prevTasks];
        return updatedTasks;
      });

      setShowCreateModal(false);
      setNotification({ type: 'success', message: 'Task created successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: error.response?.data?.message || 'Error creating task' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.main}>
      <div style={styles.statsGrid}>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} style={{ ...styles.statCard }}>
            <div style={styles.statLabel}>{label}</div>
            <div style={{ ...styles.statValue, color: getStatusColor(status) }}>{statusCounts[status] || 0}</div>
          </div>
        ))}
      </div>
      <div style={styles.filtersSection}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              style={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Assignee</label>
            <select
              style={styles.filterSelect}
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              {tasks
                .map(t => t.assignedTo)
                .filter((v, i, a) => v && a.findIndex(x => (x?._id || x) === (v?._id || v)) === i)
                .map(assignee => (
                  <option key={assignee?._id || assignee} value={assignee?._id || assignee}>
                    {assignee?.name || assignee?.email || 'Unknown'}
                  </option>
                ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Priority</label>
            <select
              style={styles.filterSelect}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
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
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort By</label>
            <select
              style={styles.filterSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
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
        <button
          style={styles.clearFiltersButton}
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
      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}
      <div style={styles.tasksContainer}>
        {paginatedTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3 style={styles.emptyTitle}>No tasks found</h3>
            <p style={styles.emptyText}>
              {statusFilter || assigneeFilter || priorityFilter || searchFilter
                ? 'Try adjusting your filters or create a new task.'
                : 'Create your first task to get started!'}
            </p>
            {/* You can add a create task button/modal here if needed */}
          </div>
        ) : (
          <div style={view === 'grid' ? styles.tasksGrid : styles.tasksList}>
            {paginatedTasks.map(task => (
              <EnhancedTaskCard key={task._id} task={task} onUpdate={() => {}} />
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{
              ...styles.pageButton,
              ...(page === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
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
              ...styles.pageButton,
              ...(page === totalPages ? { opacity: 0.5, cursor: 'not-allowed' } : {})
            }}
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskManager; 