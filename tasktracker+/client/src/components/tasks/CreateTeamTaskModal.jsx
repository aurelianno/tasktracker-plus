/*
  CreateTeamTaskModal.jsx
  Modal component for creating new team tasks in TaskTracker+.
  - Handles input validation, team member assignment, and submission.
  - Integrates with Redux and backend API for team task creation.
  - Provides a user-friendly UI for collaborative task management.
*/
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTeamTask, clearErrors } from '../../store/slices/taskAssignmentSlice';
import { canManageTeamTasks } from '../../utils/roleValidation';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const CreateTeamTaskModal = ({ isOpen, onClose, selectedTeamId, canCreate = true, onSuccess }) => {
  const dispatch = useDispatch();
  const { teams } = useSelector(state => state.teams);
  const { isCreatingTeamTask, error } = useSelector(state => state.taskAssignment);
  const user = useSelector(state => state.auth.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [tags, setTags] = useState('');
  const [success, setSuccess] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    if (isOpen && selectedTeamId) {
      const team = teams.find(t => t._id === selectedTeamId);
      setTeamMembers(team ? team.members : []);
    }
    if (!isOpen) {
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setAssignedTo(''); setTags(''); setTagInput(''); setStatus('todo');
      dispatch(clearErrors());
    }
  }, [isOpen, selectedTeamId, teams, dispatch]);

  // Tag logic
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.split(',').map(t => t.trim()).includes(tagInput.trim())) {
      setTags(tags ? tags + ',' + tagInput.trim() : tagInput.trim());
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.split(',').map(t => t.trim()).filter(t => t && t !== tagToRemove).join(','));
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Task title is required';
    if (title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';
    if (description && description.length > 1000) newErrors.description = 'Description cannot exceed 1000 characters';
    
    // Make due date required
    if (!dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    setFormErrors({});
    setShowLoadingOverlay(true);
    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    const result = await dispatch(createTeamTask({ teamId: selectedTeamId, taskData }));
    setShowLoadingOverlay(false);
    if (!result.error) {
      setSuccess('Task created successfully!');
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setAssignedTo(''); setTags(''); setTagInput(''); setStatus('todo');
      setTimeout(() => {
        setSuccess('');
        if (typeof onSuccess === 'function') onSuccess();
        onClose();
      }, 1200);
    }
  };

  if (!isOpen) return null;
  if (!canCreate) {
    return (
      <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
        <div style={{background:'white',borderRadius:24,boxShadow:'0 20px 60px rgba(0,0,0,0.18)',width:'100%',maxWidth:500,padding:32,position:'relative'}}>
          <h2 style={{fontSize:22,fontWeight:700,color:'#1e293b',marginBottom:8,textAlign:'center'}}>Permission Denied</h2>
          <p style={{textAlign:'center',color:'#6b7280',fontSize:15}}>You do not have permission to create tasks for this team.</p>
          <button style={{marginTop:24,width:'100%',padding:'12px 0',borderRadius:10,background:'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',color:'white',fontWeight:600,fontSize:15,border:'none',cursor:'pointer'}} onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

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

  return (
    <>
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create New Task</h2>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseOver={e => e.target.style.background = '#f3f4f6'}
              onMouseOut={e => e.target.style.background = 'none'}
            >
              ✕
            </button>
          </div>

          {success && (
            <div style={{...styles.generalError, color:'#10b981',background:'rgba(16,185,129,0.08)',border:'1px solid #bbf7d0'}}>{success}</div>
          )}

          <form style={styles.form} onSubmit={handleSubmit} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label}>Task Title *</label>
              <input
                style={{
                  ...styles.input,
                  ...(formErrors.title ? styles.inputError : {})
                }}
                type="text"
                name="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter task title..."
                maxLength={100}
              />
              {formErrors.title && <div style={styles.errorMessage}>{formErrors.title}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{
                  ...styles.textarea,
                  ...(formErrors.description ? styles.inputError : {})
                }}
                name="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter task description..."
                maxLength={1000}
              />
              {formErrors.description && <div style={styles.errorMessage}>{formErrors.description}</div>}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  style={styles.select}
                  name="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
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
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date *</label>
              <input
                style={{
                  ...styles.input,
                  ...(formErrors.dueDate ? styles.inputError : {})
                }}
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.dueDate && <div style={styles.errorMessage}>{formErrors.dueDate}</div>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To</label>
              <select
                style={styles.select}
                name="assignedTo"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.userId?._id || member.userId} value={member.userId?._id || member.userId}>
                    {member.userId?.name || member.name || member.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.tagsContainer}>
              <label style={styles.label}>Tags</label>
              <div style={styles.tagInputRow}>
                <input
                  style={styles.tagInput}
                  type="text"
                  name="tagInput"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
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
              {tags && tags.split(',').filter(Boolean).length > 0 && (
                <div style={styles.tagsDisplay}>
                  {tags.split(',').filter(Boolean).map((tag, index) => (
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
                disabled={isCreatingTeamTask}
                onMouseOver={e => {
                  if (!isCreatingTeamTask) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={e => {
                  if (!isCreatingTeamTask) {
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
                  ...(isCreatingTeamTask ? styles.submitButtonDisabled : {})
                }}
                disabled={isCreatingTeamTask}
                onMouseOver={e => {
                  if (!isCreatingTeamTask) {
                    e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.35)';
                  }
                }}
                onMouseOut={e => {
                  if (!isCreatingTeamTask) {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.25)';
                  }
                }}
              >
                Create Task
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

export default CreateTeamTaskModal; 