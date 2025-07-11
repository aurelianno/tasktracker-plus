import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import teamReducer from './slices/teamSlice';
import taskAssignmentReducer from './slices/taskAssignmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer, 
    teams: teamReducer,
    taskAssignment: taskAssignmentReducer,
  },
});