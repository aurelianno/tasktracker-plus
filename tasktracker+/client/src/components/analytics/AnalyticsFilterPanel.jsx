import React, { useState } from 'react';

const styles = {
  panel: {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(31,38,135,0.08)',
    border: '1px solid #f1f5f9',
    padding: '24px 32px',
    marginBottom: 40,
    display: 'flex',
    gap: 32,
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 160,
  },
  label: {
    fontWeight: 600,
    color: '#374151',
    fontSize: 14,
    marginBottom: 2,
  },
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    background: 'white',
    color: '#374151',
    outline: 'none',
    transition: 'border 0.2s',
  },
  checkboxGroup: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  checkbox: {
    accentColor: '#2563eb',
    width: 16,
    height: 16,
  },
  dateRange: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  customDate: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    background: 'white',
    color: '#374151',
    outline: 'none',
    width: 120,
  },
};

const dateRanges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Custom', value: 'custom' },
];

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const AnalyticsFilterPanel = ({ onChange }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Placeholder: call onChange with all filters
  const handleApply = () => {
    onChange && onChange({ dateRange, customStart, customEnd });
  };

  return (
    <div style={{ ...styles.panel, marginBottom: 56 }}>
      {/* Date Range Picker */}
      <div style={styles.group}>
        <label style={styles.label}>Date Range</label>
        <select
          style={styles.select}
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          {dateRanges.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {dateRange === 'custom' && (
          <div style={styles.dateRange}>
            <input
              type="date"
              style={styles.customDate}
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              style={styles.customDate}
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>
      {/* Apply Button */}
      <button
        style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          marginLeft: 'auto',
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onClick={handleApply}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default AnalyticsFilterPanel; 