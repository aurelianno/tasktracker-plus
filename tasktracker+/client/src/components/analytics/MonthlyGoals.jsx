import React from 'react';
import { useTheme } from '../../ThemeContext.jsx';

const styles = {
  container: {
    background: 'white',
    borderRadius: 20,
    padding: 'clamp(24px, 4vw, 40px)',
    border: '1px solid #f1f5f9',
    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto 24px auto',
    marginBottom: 32,
    boxSizing: 'border-box',
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalRow: {
    marginBottom: 24,
  },
  label: {
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontSize: 15,
  },
  progressBarBg: {
    background: '#f3f4f6',
    borderRadius: 8,
    height: 18,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.5s',
  },
  percent: {
    fontWeight: 700,
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 12,
  },
  daysLeft: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'right',
  },
};

const MonthlyGoals = ({ goals }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  // Calculate days left in month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = (lastDay.getDate() - today.getDate());
  const tasksGoal = goals?.tasksGoal ?? 30;
  const tasksCompleted = goals?.tasksCompleted ?? 18;
  const completionRateGoal = goals?.completionRateGoal ?? 80;
  const completionRate = goals?.completionRate ?? 67;

  return (
    <div style={{ ...styles.container, border: `1.5px solid ${borderColor}` }}>
      <div style={styles.title}>Monthly Goals</div>
      {/* Tasks to Complete */}
      <div style={styles.goalRow}>
        <div style={styles.label}>Tasks Completed</div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBar, background: '#2563eb', width: `${(tasksCompleted / tasksGoal) * 100}%` }} />
        </div>
        <span style={styles.percent}>{Math.round((tasksCompleted / tasksGoal) * 100)}%</span>
      </div>
      {/* Completion Rate Target */}
      <div style={styles.goalRow}>
        <div style={styles.label}>Completion Rate Target</div>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBar, background: '#10b981', width: `${(completionRate / completionRateGoal) * 100}%` }} />
        </div>
        <span style={styles.percent}>{Math.round((completionRate / completionRateGoal) * 100)}%</span>
      </div>
      <div style={styles.daysLeft}>{daysLeft} days left in month</div>
    </div>
  );
};

export default MonthlyGoals; 