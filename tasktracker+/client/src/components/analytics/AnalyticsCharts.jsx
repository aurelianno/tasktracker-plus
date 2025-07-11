import React from 'react';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';
import { useTheme } from '../../ThemeContext.jsx';

const AnalyticsCharts = ({ statusData, priorityData, weeklyTrendData, monthlyProgressData, chartOptions, lineChartOptions }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '32px',
        width: '100%',
        boxSizing: 'border-box',
        justifyItems: 'center',
      }}
    >
      {/* Status Pie Chart */}
      <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)', border: `1.5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 340, maxWidth: 520, width: '100%' }}>
        <h3 style={{ textAlign: 'center', color: 'var(--dark)', fontWeight: 600, marginBottom: 16 }}>Task Status Distribution</h3>
        <div style={{ height: 320, position: 'relative' }}>
          <Pie data={statusData} options={chartOptions} />
        </div>
      </div>
      {/* Priority Doughnut Chart */}
      <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)', border: `1.5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 340, maxWidth: 520, width: '100%' }}>
        <h3 style={{ textAlign: 'center', color: 'var(--dark)', fontWeight: 600, marginBottom: 16 }}>Priority Distribution</h3>
        <div style={{ height: 320, position: 'relative' }}>
          <Doughnut data={priorityData} options={chartOptions} />
        </div>
      </div>
      {/* Weekly Completion Trends Line Chart */}
      <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)', border: `1.5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 340, maxWidth: 520, width: '100%' }}>
        <h3 style={{ textAlign: 'center', color: 'var(--dark)', fontWeight: 600, marginBottom: 16 }}>Weekly Completion Trends</h3>
        <div style={{ height: 320, position: 'relative' }}>
          <Line data={weeklyTrendData} options={lineChartOptions} />
        </div>
      </div>
      {/* Monthly Progress Bar Chart */}
      <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)', border: `1.5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 340, maxWidth: 520, width: '100%' }}>
        <h3 style={{ textAlign: 'center', color: 'var(--dark)', fontWeight: 600, marginBottom: 16 }}>Monthly Progress</h3>
        <div style={{ height: 320, position: 'relative' }}>
          <Bar data={monthlyProgressData} options={chartOptions} />
        </div>
      </div>
      {/* Responsive: 1 column on mobile */}
      <style>{`@media (max-width: 900px) { .analytics-charts-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default AnalyticsCharts; 