import React from 'react';
import { Bar } from 'react-chartjs-2';
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
  minWidth: 340,
  maxWidth: 520,
  width: '100%',
  margin: '0 auto',
};

const PeakPerformanceHours = ({ hourlyData }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  if (!hourlyData || hourlyData.length !== 24) return null;
  const maxHour = hourlyData.indexOf(Math.max(...hourlyData));
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Tasks Completed',
        data: hourlyData,
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barThickness: 16,
        borderSkipped: false,
      },
    ],
  };
  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.08)' },
        ticks: { stepSize: 1 },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.08)' },
      },
    },
  };
  return (
    <div style={{ ...cardStyle, border: `1.5px solid ${borderColor}` }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16, textAlign: 'center' }}>
        Peak Performance Hours
      </h3>
      <div style={{ width: '100%', height: 340 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div style={{ marginTop: 18, color: '#64748b', fontSize: 14, textAlign: 'center' }}>
        {`Your most productive hour is ${maxHour}:00 - ${maxHour + 1}:00.`}
      </div>
    </div>
  );
};

export default PeakPerformanceHours; 