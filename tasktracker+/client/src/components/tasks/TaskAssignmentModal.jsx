/*
  TaskAssignmentModal.jsx
  Modal component for assigning tasks to team members in TaskTracker+.
  - Allows admins/owners to assign or reassign tasks within a team.
  - Integrates with Redux and backend API for assignment actions.
  - Ensures role-based access and user feedback.
*/

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  assignTask,
  reassignTask,
  unassignTask,
  clearErrors
} from '../../store/slices/taskAssignmentSlice';

const MODES = {
  assign: 'Assign Task',
  reassign: 'Reassign Task',
  unassign: 'Unassign Task'
};

const TaskAssignmentModal = ({ isOpen, onClose, task, selectedTeamId, mode = 'assign' }) => {
  const dispatch = useDispatch();
  const { teams } = useSelector(state => state.teams);
  const assignmentState = useSelector(state => state.taskAssignment);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [note, setNote] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (isOpen && selectedTeamId) {
      const team = teams.find(t => t._id === selectedTeamId);
      setTeamMembers(team ? team.members : []);
    }
    if (!isOpen) {
      setSelectedMemberId('');
      setNote('');
      dispatch(clearErrors());
    }
  }, [isOpen, selectedTeamId, teams, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'assign') {
      await dispatch(assignTask({ taskId: task._id, memberId: selectedMemberId, teamId: selectedTeamId, note }));
    } else if (mode === 'reassign') {
      await dispatch(reassignTask({ taskId: task._id, newMemberId: selectedMemberId, note }));
    } else if (mode === 'unassign') {
      await dispatch(unassignTask({ taskId: task._id, note }));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">{MODES[mode]}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {(mode === 'assign' || mode === 'reassign') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
              <select
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                required
              >
                <option value="">Select a member</option>
                {teamMembers.map(member => (
                  <option key={member.userId?._id || member.userId} value={member.userId?._id || member.userId}>
                    {member.userId?.name || member.name || member.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={200}
              placeholder="Reason for assignment (optional)"
            />
          </div>
          {assignmentState.error && (
            <div className="text-red-500 text-sm text-center">{assignmentState.error}</div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              onClick={onClose}
              disabled={assignmentState.isAssigning || assignmentState.isReassigning || assignmentState.isUnassigning}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={
                (mode !== 'unassign' && !selectedMemberId) ||
                assignmentState.isAssigning || assignmentState.isReassigning || assignmentState.isUnassigning
              }
            >
              {assignmentState.isAssigning || assignmentState.isReassigning || assignmentState.isUnassigning
                ? (mode === 'assign' ? 'Assigning...' : mode === 'reassign' ? 'Reassigning...' : 'Unassigning...')
                : MODES[mode]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskAssignmentModal;
