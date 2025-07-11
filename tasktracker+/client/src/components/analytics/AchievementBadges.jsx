import React from 'react';

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 100%)',
  color: '#2563eb',
  borderRadius: 16,
  padding: '4px 12px',
  fontWeight: 600,
  fontSize: 13,
  margin: '0 8px 8px 0',
  boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
  border: '1px solid #e0e7ef',
  minHeight: 28,
};
const AchievementBadges = ({ badges = [], productivityScore, message }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
    {badges.map((b, i) => (
      <span key={i} style={badgeStyle}>{b.icon} {b.text}</span>
    ))}
    {typeof productivityScore === 'number' && (
      <span style={{ ...badgeStyle, background: 'linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 100%)', color: '#0ea5e9' }}>💯 Productivity Score: {productivityScore}</span>
    )}
    {message && (
      <span style={{ ...badgeStyle, background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)', color: '#b45309' }}>{message}</span>
    )}
  </div>
);

export default AchievementBadges; 