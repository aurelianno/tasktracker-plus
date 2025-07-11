/*
  EnhancedTaskCard.jsx
  Enhanced card component for displaying tasks with additional analytics and actions.
  - Shows task KPIs, assignment, and quick actions for team collaboration.
  - Used in analytics and team views for richer task insights.
  - Integrates with Redux and backend API for updates.
*/
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isTeamAdmin, isTeamOwner, canManageTeamTasks } from '../../utils/roleValidation';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';
import TaskAssignmentModal from './TaskAssignmentModal';

const STATUS_LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'overdue': 'Overdue'
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

const EnhancedTaskCard = ({
  task,
  selectedTeamId,
  onEdit,
  onDelete,
  canEdit = false,
  canArchive = false,
  canDelete = false,
  canChangeStatus = false,
  isArchived = false
}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('assign');

  const isCreator = user && task.createdBy && (user._id === task.createdBy._id || user.id === task.createdBy._id);
  const isAssignee = user && task.assignedTo && (user._id === task.assignedTo._id || user.id === task.assignedTo._id);
  const isAdmin = canManageTeamTasks(user, selectedTeamId);
  const isOwner = isTeamOwner(user, selectedTeamId);

  // Assignment info
  const assignedTo = task.assignedTo?.name || task.assignedTo?.email || 'Unassigned';
  const assignedDate = task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : null;

  // Assignment badge
  let assignmentType = 'personal';
  if (task.teamId) assignmentType = 'team';
  if (task.assignedTo) assignmentType = 'assigned';

  // Permission logic for actions
  const showEdit = canEdit;
  const showDelete = canDelete;
  const showArchive = canArchive;
  const showAssign = isAdmin || isOwner;
  const canStart = canChangeStatus && task.status === 'todo';
  const canComplete = canChangeStatus && (task.status === 'in-progress' || task.status === 'overdue');

  const handleStatusUpdate = (newStatus) => {
    dispatch(updateTask({ taskId: task._id, taskData: { status: newStatus } }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 border border-gray-300 dark:border-gray-600 relative">
      {/* Status badge */}
      <div className="absolute top-4 right-4 flex gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          task.status === 'completed' ? 'bg-green-100 text-green-700' :
          task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          task.status === 'overdue' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          assignmentType === 'team' ? 'bg-indigo-100 text-indigo-700' :
          assignmentType === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {assignmentType === 'team' ? 'Team Task' : assignmentType === 'assigned' ? 'Assigned' : 'Personal'}
        </span>
        {isArchived && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-300 text-gray-700">Archived</span>
        )}
      </div>
      {/* Title & Description */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
      <p className="text-gray-700 mb-2 line-clamp-3">{task.description}</p>
      {/* Priority & Due Date */}
      <div className="flex gap-4 text-sm text-gray-500 mb-2">
        <span className="font-medium">Priority:</span>
        <span>{PRIORITY_LABELS[task.priority] || task.priority}</span>
        {task.dueDate && <span className="ml-4 font-medium">Due: <span className="font-normal">{new Date(task.dueDate).toLocaleDateString()}</span></span>}
      </div>
      {/* Assignment Info */}
      <div className="flex gap-4 text-sm text-gray-500 mb-2">
        <span className="font-medium">Assigned to:</span>
        <span>{assignedTo}</span>
        {assignedDate && <span className="ml-4 font-medium">On: <span className="font-normal">{assignedDate}</span></span>}
      </div>
      {/* Actions Dropdown */}
      <div className="flex gap-2 mt-2">
        {showEdit && (
          <button
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
            onClick={onEdit}
          >Edit</button>
        )}
        {showArchive && (
          <button
            className="px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 text-xs font-semibold"
            // onClick={...} // TODO: implement archive logic
          >Archive</button>
        )}
        {showDelete && (
          <button
            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
            onClick={onDelete}
          >Delete</button>
        )}
        {showAssign && (
          <>
            <button
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
              onClick={() => { setModalMode('assign'); setModalOpen(true); }}
            >Assign</button>
            <button
              className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs font-semibold"
              onClick={() => { setModalMode('reassign'); setModalOpen(true); }}
            >Reassign</button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs font-semibold"
              onClick={() => { setModalMode('unassign'); setModalOpen(true); }}
            >Unassign</button>
          </>
        )}
        {canStart && (
          <button
            className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-semibold"
            onClick={() => handleStatusUpdate('in-progress')}
          >Start</button>
        )}
        {canComplete && (
          <button
            className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold"
            onClick={() => handleStatusUpdate('completed')}
          >Complete</button>
        )}
      </div>
      {/* Assignment Modal */}
      <TaskAssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={task}
        selectedTeamId={selectedTeamId}
        mode={modalMode}
      />
    </div>
  );
};

export default EnhancedTaskCard; 