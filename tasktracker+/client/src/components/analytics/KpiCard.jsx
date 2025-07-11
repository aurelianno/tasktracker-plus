import React from 'react';
import { useTheme } from '../../ThemeContext.jsx';

const KpiCard = ({ icon, title, value, change, changeType, highlight }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  const color = changeType === 'positive' ? 'var(--success)' : 'var(--danger)';
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        padding: '32px 28px',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
        border: `1.5px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 220,
        maxWidth: 340,
        width: '100%',
        transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
        cursor: 'pointer',
        ...(highlight ? { border: '2px solid #2563eb', boxShadow: '0 12px 32px 0 rgba(37,99,235,0.10)' } : {}),
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'scale(1.045)';
        e.currentTarget.style.boxShadow = '0 16px 40px 0 rgba(37,99,235,0.13)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = highlight ? '0 12px 32px 0 rgba(37,99,235,0.10)' : '0 8px 32px 0 rgba(31,38,135,0.08)';
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 6 }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 28, color: '#2563eb', marginBottom: 8 }}>{value}</div>
      {change && (
        <div style={{ fontSize: 14, color: changeType === 'positive' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{change}</div>
      )}
    </div>
  );
};

export default KpiCard; 