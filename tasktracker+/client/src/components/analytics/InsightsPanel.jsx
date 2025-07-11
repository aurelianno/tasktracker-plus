import React from 'react';

const InsightsPanel = ({ insights = [], recommendations = [] }) => {
  return (
    <div style={{
      marginTop: '48px', // Increased spacing from charts above
      marginBottom: '32px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '32px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Productivity Insights */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Distinct gradient background
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
        border: 'none',
      }}>
        <h3 style={{ 
          color: 'white', 
          fontWeight: 700, 
          marginBottom: 16,
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 Productivity Insights
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {insights.length === 0 && (
            <li style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: 15, 
              opacity: 0.8,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              No insights available yet.
            </li>
          )}
          {insights.map((insight, idx) => (
            <li key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 12, 
              fontSize: 15, 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(255, 255, 255, 0.2)'
              }
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
              <span style={{ fontSize: 18, marginRight: 10 }}>{insight.icon}</span>
              {insight.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Distinct gradient background
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
        border: 'none',
      }}>
        <h3 style={{ 
          color: 'white', 
          fontWeight: 700, 
          marginBottom: 16,
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💡 Recommendations
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {recommendations.length === 0 && (
            <li style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: 15, 
              opacity: 0.8,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              🌟 Keep up the great work! Your task management is on track.
            </li>
          )}
          {recommendations.map((rec, idx) => (
            <li key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 12, 
              fontSize: 15, 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
              <span style={{ fontSize: 18, marginRight: 10 }}>{rec.icon}</span>
              {rec.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsPanel;