import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../ThemeContext.jsx';

// Helper to get color class based on count
function getClassForValue(value, max) {
  if (!value || value.count === 0) return 'color-empty';
  // 4 levels of intensity
  const ratio = value.count / (max || 1);
  if (ratio > 0.75) return 'color-scale-4';
  if (ratio > 0.5) return 'color-scale-3';
  if (ratio > 0.25) return 'color-scale-2';
  return 'color-scale-1';
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '20px',
    padding: 'clamp(24px, 4vw, 40px)',
    border: '1px solid #f1f5f9',
    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 340,
    maxWidth: 520,
    minHeight: 320,
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  heatmapWrapper: {
    width: '100%',
    marginBottom: 0,
    height: 320,
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
    fontSize: 12,
    color: '#64748b',
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '1px solid #e5e7eb',
    marginRight: 4,
  },
};

const ProductivityHeatmap = ({ data, velocityData }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  const hasData = Array.isArray(data) && data.length > 0 && data.some(d => d.count > 0);
  const startDate = data && data.length > 0 ? data[0].date : null;
  const endDate = data && data.length > 0 ? data[data.length - 1].date : null;
  const max = hasData ? Math.max(...data.map(d => d.count)) : 0;

  return (
    <div style={{ ...styles.container, border: `1.5px solid ${borderColor}` }}>
      <h3 style={styles.title}>Productivity Heatmap (Last 3 Months)</h3>
      <div style={styles.heatmapWrapper}>
        {hasData && startDate && endDate ? (
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={data}
            classForValue={v => getClassForValue(v, max)}
            showWeekdayLabels={false}
            horizontal={true}
            style={{ height: 320, width: '100%' }}
            tooltipDataAttrs={value => {
              if (!value || !value.date) return null;
              return {
                'data-tip': `${value.date}: ${value.count} task${value.count === 1 ? '' : 's'} completed`,
              };
            }}
            gutterSize={3}
          />
        ) : (
          <div style={{
            height: 320,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 16,
            fontWeight: 500,
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px dashed #e5e7eb'
          }}>
            No productivity data for the last 3 months.
          </div>
        )}
      </div>
      {/* Legend */}
      <div style={styles.legend}>
        <span>Less</span>
        <span style={{ ...styles.legendBox, background: '#f3f4f6' }}></span>
        <span style={{ ...styles.legendBox, background: '#d1fae5' }}></span>
        <span style={{ ...styles.legendBox, background: '#6ee7b7' }}></span>
        <span style={{ ...styles.legendBox, background: '#10b981' }}></span>
        <span style={{ ...styles.legendBox, background: '#047857' }}></span>
        <span>More</span>
      </div>
      {/* Velocity Chart */}
      {velocityData && velocityData.labels && velocityData.labels.length > 0 && (
        <div style={{ marginTop: 200 }}>
          <h3 style={{ ...styles.title, marginBottom: 8 }}>Task Velocity (Last 12 Weeks)</h3>
          <div style={{ height: 220, width: '100%' }}>
            <Line data={velocityData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.08)' },
                  ticks: { stepSize: 1 }
                },
                x: {
                  grid: { color: 'rgba(0,0,0,0.08)' }
                }
              }
            }} />
          </div>
        </div>
      )}
      {/* Custom styles for color scale */}
      <style>{`
        .color-empty { fill: #f3f4f6; }
        .color-scale-1 { fill: #d1fae5; }
        .color-scale-2 { fill: #6ee7b7; }
        .color-scale-3 { fill: #10b981; }
        .color-scale-4 { fill: #047857; }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          fill: #64748b;
          font-size: 11px;
          text-anchor: start;
          dominant-baseline: middle;
          transform: translateX(-10px);
        }
        .react-calendar-heatmap text { font-size: 10px; }
      `}</style>
    </div>
  );
};

export default ProductivityHeatmap; 