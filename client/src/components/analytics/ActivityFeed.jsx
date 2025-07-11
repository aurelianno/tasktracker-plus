import React from 'react';
import { useTheme } from '../../ThemeContext.jsx';

const ActivityFeed = ({ activities = [] }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: 'clamp(16px, 4vw, 32px)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
      border: `1.5px solid ${borderColor}`,
      maxWidth: '900px',
      margin: '0 auto 32px auto',
      width: '100%',
      minHeight: 180,
    }}>
      <h3 style={{ color: 'var(--info)', fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {activities.length === 0 && (
          <li style={{ color: 'var(--dark)', fontSize: 15, opacity: 0.7 }}>No recent activity.</li>
        )}
        {activities.map((a, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 14, fontSize: 15, color: 'var(--dark)' }}>
            <span style={{ fontSize: 20, marginRight: 12 }}>{a.icon}</span>
            <span style={{ fontWeight: 600, marginRight: 8 }}>{a.task}</span>
            <span style={{ color: 'var(--primary)', marginRight: 8 }}>{a.action}</span>
            <span style={{ color: 'var(--dark)', opacity: 0.6, fontSize: 13 }}>{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed; 