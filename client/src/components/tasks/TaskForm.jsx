/*
  TaskForm.jsx
  Form component for creating and editing tasks in TaskTracker+.
  - Handles input validation, submission, and error handling.
  - Supports both personal and team tasks with dynamic fields.
  - Integrates with Redux and backend API for task persistence.
*/
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, reset } from '../../store/slices/taskSlice';

const TaskForm = ({ isOpen, onClose, onSuccess, task = null, mode = 'create', teamMembers = null }) => {
  const dispatch = useDispatch();
  const { isCreating, isUpdating, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedTo: user?.userId || user?._id || '', // Handle both formats
        dueDate: '',
        tags: []
      });
    }
  }, [task, mode, user]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    
    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    if (teamMembers && !formData.assignedTo) {
      newErrors.assignedTo = 'You must assign this task to a team member.';
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setShowLoadingOverlay(true);

    try {
      if (mode === 'edit') {
        await dispatch(updateTask({
          taskId: task._id,
          taskData: formData
        }));
      } else {
        await dispatch(createTask(formData));
      }
      
      onSuccess();
    } catch (error) {
      setErrors({ general: error.message || 'Failed to save task. Please try again.' });
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.6)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px',
      borderRadius: '6px',
      transition: 'background 0.2s ease'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit'
    },
    inputFocus: {
      borderColor: '#2563eb',
      outline: 'none'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    tagsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    tagInputRow: {
      display: 'flex',
      gap: '8px'
    },
    tagInput: {
      flex: 1,
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px'
    },
    addTagButton: {
      padding: '8px 16px',
      background: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    tagsDisplay: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: '#eff6ff',
      color: '#1d4ed8',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    tagRemove: {
      background: 'none',
      border: 'none',
      color: '#1d4ed8',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '0',
      lineHeight: 1
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px'
    },
    generalError: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    buttonRow: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end',
      marginTop: '32px'
    },
    button: {
      padding: '14px 28px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      minWidth: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    cancelButton: {
      background: 'white',
      color: '#374151',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none !important'
    },
    loadingSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <>
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>
              {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseOver={e => e.target.style.background = '#f3f4f6'}
              onMouseOut={e => e.target.style.background = 'none'}
            >
              ✕
            </button>
          </div>

          {error && !Object.keys(errors).length && (
            <div style={styles.generalError}>
              {error}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>Task Title *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.title ? styles.inputError : {})
                }}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                maxLength={100}
              />
              {errors.title && <div style={styles.errorMessage}>{errors.title}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{
                  ...styles.textarea,
                  ...(errors.description ? styles.inputError : {})
                }}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description..."
                maxLength={1000}
              />
              {errors.description && <div style={styles.errorMessage}>{errors.description}</div>}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  style={styles.select}
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.dueDate ? styles.inputError : {})
                }}
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <div style={styles.errorMessage}>{errors.dueDate}</div>}
            </div>

            {teamMembers && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Assign To</label>
                <select
                  style={styles.select}
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                >
                  {teamMembers.map(member => (
                    <option key={member.userId?._id || member.userId} value={member.userId?._id || member.userId}>
                      {member.userId?.name || member.name || member.email}
                    </option>
                  ))}
                </select>
                {errors.assignedTo && <div style={styles.errorMessage}>{errors.assignedTo}</div>}
              </div>
            )}

            <div style={styles.tagsContainer}>
              <label style={styles.label}>Tags</label>
              <div style={styles.tagInputRow}>
                <input
                  style={styles.tagInput}
                  type="text"
                  name="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  maxLength={20}
                />
                <button
                  type="button"
                  style={styles.addTagButton}
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div style={styles.tagsDisplay}>
                  {formData.tags.map((tag, index) => (
                    <div key={index} style={styles.tag}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        style={styles.tagRemove}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={onClose}
                disabled={isLoading}
                onMouseOver={e => {
                  if (!isLoading) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={e => {
                  if (!isLoading) {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.submitButtonDisabled : {})
                }}
                disabled={isLoading}
                onMouseOver={e => {
                  if (!isLoading) {
                    e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.35)';
                  }
                }}
                onMouseOut={e => {
                  if (!isLoading) {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.25)';
                  }
                }}
              >
                {mode === 'edit' ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TaskForm;