import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import ProductivityHeatmap from './ProductivityHeatmap';
import { useTheme } from '../../ThemeContext.jsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const TaskAnalytics = ({ analytics }) => {
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
  // Prepare data for status distribution pie chart
  const statusData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [
          analytics.statusDistribution?.todo || 0,
          analytics.statusDistribution?.['in-progress'] || 0,
          analytics.statusDistribution?.completed || 0,
          analytics.statusDistribution?.overdue || 0,
        ],
        backgroundColor: [
          '#6b7280', // Gray for To Do
          '#2563eb', // Blue for In Progress
          '#10b981', // Green for Completed
          '#ef4444', // Red for Overdue
        ],
        borderColor: [
          '#4b5563',
          '#1d4ed8',
          '#059669',
          '#dc2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for priority distribution bar chart
  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          analytics.priorityDistribution?.low || 0,
          analytics.priorityDistribution?.medium || 0,
          analytics.priorityDistribution?.high || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for Low
          'rgba(251, 191, 36, 0.8)', // Yellow for Medium
          'rgba(239, 68, 68, 0.8)', // Red for High
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for completion trends line chart (last 7 days)
  const completionTrendData = {
    labels: analytics.completionTrend?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: analytics.completionTrend?.map(d => d.count) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Calculate insights based on analytics data
  const generateInsights = () => {
    const totalTasks = (analytics.statusDistribution?.todo || 0) + 
                      (analytics.statusDistribution?.['in-progress'] || 0) + 
                      (analytics.statusDistribution?.completed || 0) + 
                      (analytics.statusDistribution?.overdue || 0);
    
    const completedTasks = analytics.statusDistribution?.completed || 0;
    const overdueTasks = analytics.statusDistribution?.overdue || 0;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    
    const insights = [];
    
    if (completionRate > 70) {
      insights.push("🚀 Excellent productivity! You're completing tasks efficiently.");
    } else if (completionRate > 50) {
      insights.push("📈 Good progress! Consider focusing on completing pending tasks.");
    } else {
      insights.push("💪 Room for improvement. Focus on task completion strategies.");
    }
    
    if (overdueTasks > 0) {
      insights.push(`⚠️ ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''} need${overdueTasks === 1 ? 's' : ''} immediate attention.`);
    } else {
      insights.push("✅ Great job! No overdue tasks.");
    }
    
    const highPriorityTasks = analytics.priorityDistribution?.high || 0;
    if (highPriorityTasks > 5) {
      insights.push("🔥 Many high-priority tasks. Consider delegating or breaking them down.");
    }
    
    return insights;
  };

  // Generate recommendations
  const generateRecommendations = () => {
    const recommendations = [];
    const overdueTasks = analytics.statusDistribution?.overdue || 0;
    const inProgressTasks = analytics.statusDistribution?.['in-progress'] || 0;
    const highPriorityTasks = analytics.priorityDistribution?.high || 0;
    
    if (overdueTasks > 0) {
      recommendations.push("🎯 Prioritize overdue tasks to get back on track");
    }
    
    if (inProgressTasks > 10) {
      recommendations.push("📋 Too many tasks in progress. Focus on completing them before starting new ones");
    }
    
    if (highPriorityTasks > 3) {
      recommendations.push("🚨 Break down high-priority tasks into smaller, manageable steps");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("🌟 Keep up the great work! Your task management is on track");
    }
    
    return recommendations;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const styles = {
    container: {
      background: 'transparent',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
      border: 'none',
      boxShadow: 'none',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto 24px auto',
      boxSizing: 'border-box',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
      width: '100%',
      overflowX: 'auto',
      boxSizing: 'border-box',
    },
    chartContainer: {
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      border: `1.5px solid ${borderColor}`,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
      width: '100%',
      boxSizing: 'border-box',
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px',
      textAlign: 'center',
    },
    chartWrapper: {
      height: '300px',
      position: 'relative',
    },
    insightsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginTop: '32px', // Clear separation from charts
    },
    insightsBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    },
    recommendationsBox: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    insightItem: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px',
      fontSize: '14px',
      lineHeight: '1.5',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    lastItem: {
      marginBottom: '0',
    },
  };

  const insights = generateInsights();
  const recommendations = generateRecommendations();

  return (
    <div style={styles.container}>
      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        {/* Productivity Heatmap */}
        <ProductivityHeatmap data={analytics.completionCalendar} />
        {/* Status Distribution Pie Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Task Status Distribution</h3>
          <div style={styles.chartWrapper}>
            <Pie data={statusData} options={chartOptions} />
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Tasks by Priority</h3>
          <div style={styles.chartWrapper}>
            <Bar data={priorityData} options={chartOptions} />
          </div>
        </div>

        {/* Completion Trends Line Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Completion Trends (Last 7 Days)</h3>
          <div style={styles.chartWrapper}>
            <Line data={completionTrendData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;