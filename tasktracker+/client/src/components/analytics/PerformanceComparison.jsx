import React from 'react';
import { useTheme } from '../../ThemeContext.jsx';

const cardStyle = {
  background: 'white',
  borderRadius: 20,
  padding: '32px 28px',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
  border: '1px solid #f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 220,
  maxWidth: 340,
  width: '100%',
  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
  margin: '0 12px',
};

const labelStyle = {
  fontWeight: 700,
  fontSize: 16,
  color: '#374151',
  marginBottom: 8,
};
const valueStyle = {
  fontWeight: 800,
  fontSize: 28,
  color: '#2563eb',
  marginBottom: 6,
};
const changeStyle = (type) => ({
  fontSize: 15,
  fontWeight: 600,
  color: type === 'positive' ? '#10b981' : '#ef4444',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const metrics = [
  { key: 'totalTasks', label: 'Total Tasks' },
  { key: 'completionRate', label: 'Completion Rate' },
  { key: 'tasksCompleted', label: 'Tasks Completed' },
  { key: 'productivityScore', label: 'Productivity Score' },
];

const PerformanceComparison = ({ thisMonth = {}, lastMonth = {} }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  // Placeholder: calculate % change
  const getChange = (key) => {
    const current = thisMonth[key] ?? 0;
    const prev = lastMonth[key] ?? 0;
    if (prev === 0 && current === 0) return { value: '0%', type: 'neutral' };
    if (prev === 0) return { value: '+100%', type: 'positive' };
    const diff = current - prev;
    const percent = ((diff / prev) * 100).toFixed(1);
    return {
      value: `${diff >= 0 ? '+' : ''}${percent}%`,
      type: diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral',
    };
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto 40px auto', display: 'flex', justifyContent: 'center', gap: 32 }}>
      {metrics.map(metric => {
        const change = getChange(metric.key);
        return (
          <div key={metric.key} style={{ ...cardStyle, border: `1.5px solid ${borderColor}` }}>
            <div style={labelStyle}>{metric.label}</div>
            <div style={valueStyle}>{thisMonth[metric.key] ?? '—'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>This Month</div>
            <div style={valueStyle}>{lastMonth[metric.key] ?? '—'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Last Month</div>
            <div style={changeStyle(change.type)}>
              {change.type === 'positive' && '▲'}
              {change.type === 'negative' && '▼'}
              {change.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceComparison; 